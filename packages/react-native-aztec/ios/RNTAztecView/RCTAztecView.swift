import Aztec
import CoreServices
import Foundation
import UIKit

class RCTAztecView: Aztec.TextView {
    @objc var onBackspace: RCTBubblingEventBlock? = nil
    @objc var onChange: RCTBubblingEventBlock? = nil
    @objc var onEnter: RCTBubblingEventBlock? = nil
    @objc var onFocus: RCTBubblingEventBlock? = nil
    @objc var onBlur: RCTBubblingEventBlock? = nil
    @objc var onPaste: RCTBubblingEventBlock? = nil
    @objc var onContentSizeChange: RCTBubblingEventBlock? = nil
    @objc var onSelectionChange: RCTBubblingEventBlock? = nil
    @objc var blockType: NSDictionary? = nil {
        didSet {
            guard let block = blockType, let tag = block["tag"] as? String else {
                return
            }
            blockModel = BlockModel(tag: tag)
        }
    }
    @objc var activeFormats: NSSet? = nil {
        didSet {
            let currentTypingAttributes = formattingIdentifiersForTypingAttributes()
            for (key, value) in formatStringMap where currentTypingAttributes.contains(key) != activeFormats?.contains(value) {
                toggleFormat(format: value)
            }
        }
    }
    @objc var disableEditingMenu: Bool = false {
        didSet {
            allowsEditingTextAttributes = !disableEditingMenu
        }
    }

    override var textAlignment: NSTextAlignment {
        didSet {
            super.textAlignment = textAlignment
            defaultParagraphStyle.alignment = textAlignment
            placeholderLabel.textAlignment = textAlignment
        }
    }

    var blockModel = BlockModel(tag: "") {
        didSet {
            forceTypingAttributesIfNeeded()
        }
    }

    private var previousContentSize: CGSize = .zero

    var leftTextInset: CGFloat {
        return contentInset.left + textContainerInset.left + textContainer.lineFragmentPadding
    }

    var leftTextInsetInRTLLayout: CGFloat {
        return bounds.width - leftTextInset
    }

    var hasRTLLayout: Bool {
        return reactLayoutDirection == .rightToLeft
    }

    private(set) lazy var placeholderLabel: UILabel = {
        let label = UILabel(frame: .zero)
        label.translatesAutoresizingMaskIntoConstraints = false
        label.textAlignment = .natural
        label.font = font

        return label
    }()

    // RCTScrollViews are flipped horizontally on RTL. This messes up competelly horizontal layout contraints
    // on views inserted after the transformation.
    var placeholderPreferedHorizontalAnchor: NSLayoutXAxisAnchor {
        return hasRTLLayout ? placeholderLabel.rightAnchor : placeholderLabel.leftAnchor
    }

    // This constraint is created from the prefered horizontal anchor (analog to "leading")
    // but appending it always to left of its super view (Aztec).
    // This partially fixes the position issue originated from fliping the scroll view.
    // fixLabelPositionForRTLLayout() fixes the rest.
    private lazy var placeholderHorizontalConstraint: NSLayoutConstraint = {
        return placeholderPreferedHorizontalAnchor.constraint(
            equalTo: leftAnchor,
            constant: leftTextInset
        )
    }()

    /// If a dictation start with an empty UITextView,
    /// the dictation engine refreshes the TextView with an empty string when the dictation finishes.
    /// This helps to avoid propagating that unwanted empty string to RN. (Solving #606)
    /// on `textViewDidChange` and `textViewDidChangeSelection`
    private var isInsertingDictationResult = false
    
    // MARK: - Font
    
    /// Font family for all contents  Once this is set, it will always override the font family for all of its
    /// contents, regardless of what HTML is provided to Aztec.
    private var fontFamily: String? = nil
    
    /// Font size for all contents.  Once this is set, it will always override the font size for all of its
    /// contents, regardless of what HTML is provided to Aztec.
    private var fontSize: CGFloat? = nil
    
    /// Font weight for all contents.  Once this is set, it will always override the font weight for all of its
    /// contents, regardless of what HTML is provided to Aztec.
    private var fontWeight: String? = nil

    // MARK: - Formats
    
    private let formatStringMap: [FormattingIdentifier: String] = [
        .bold: "bold",
        .italic: "italic",
        .strikethrough: "strikethrough",
        .link: "link",
    ]

    override init(defaultFont: UIFont, defaultParagraphStyle: ParagraphStyle, defaultMissingImage: UIImage) {
        super.init(defaultFont: defaultFont, defaultParagraphStyle: defaultParagraphStyle, defaultMissingImage: defaultMissingImage)
        commonInit()
    }

    required init?(coder aDecoder: NSCoder) {
        super.init(coder: aDecoder)
        commonInit()
    }

    func commonInit() {
        delegate = self
        textContainerInset = .zero
        contentInset = .zero
        addPlaceholder()
        if #available(iOS 11.0, *) {
            textDragInteraction?.isEnabled = false
        }
        storage.htmlConverter.characterToReplaceLastEmptyLine = Character(.zeroWidthSpace)
        shouldNotifyOfNonUserChanges = false
    }

    func addPlaceholder() {
        addSubview(placeholderLabel)
        let topConstant = contentInset.top + textContainerInset.top
        NSLayoutConstraint.activate([
            placeholderHorizontalConstraint,
            placeholderLabel.topAnchor.constraint(equalTo: topAnchor, constant: topConstant),
            placeholderLabel.widthAnchor.constraint(equalTo: widthAnchor),
        ])
    }

    // MARK - View Height: Match to content height

    override func layoutSubviews() {
        super.layoutSubviews()
        fixLabelPositionForRTLLayout()
        updateContentSizeInRN()
    }

    private func fixLabelPositionForRTLLayout() {
        if hasRTLLayout {
            // RCTScrollViews are flipped horizontally on RTL layout.
            // This fixes the position of the label after "fixing" (partially) the constraints.
            placeholderHorizontalConstraint.constant = leftTextInsetInRTLLayout
        }
    }

    func updateContentSizeInRN() {
        let newSize = sizeThatFits(frame.size)
        
        guard previousContentSize != newSize,
            let onContentSizeChange = onContentSizeChange else {
                return
        }
        
        previousContentSize = newSize
        
        let body = packForRN(newSize, withName: "contentSize")
        onContentSizeChange(body)
    }
    
    // MARK: - Paste handling
    private func read(from pasteboard: UIPasteboard, uti: CFString, documentType: DocumentType) -> String? {
        guard let data = pasteboard.data(forPasteboardType: uti as String),
            let attributedString = try? NSAttributedString(data: data, options: [.documentType: documentType], documentAttributes: nil),
            let storage = self.textStorage as? TextStorage else {
                return nil
        }
        return  storage.getHTML(from: attributedString)
    }

    private func readHTML(from pasteboard: UIPasteboard) -> String? {

        if let data = pasteboard.data(forPasteboardType: kUTTypeHTML as String), let html = String(data: data, encoding: .utf8) {
            // Make sure we are not getting a full HTML DOC. We only want inner content
            if !html.hasPrefix("<!DOCTYPE html") {
                return html
            }
        }

        if let flatRTFDString = read(from: pasteboard, uti: kUTTypeFlatRTFD, documentType: DocumentType.rtfd) {
            return  flatRTFDString
        }

        if let rtfString = read(from: pasteboard, uti: kUTTypeRTF, documentType: DocumentType.rtf) {
            return  rtfString
        }

        if let rtfdString = read(from: pasteboard, uti: kUTTypeRTFD, documentType: DocumentType.rtfd) {
            return  rtfdString
        }

        return nil
    }
    
    private func readText(from pasteboard: UIPasteboard) -> String? {
        var text = pasteboard.string
        // Text that comes from Aztec will have paragraphSeparator instead of line feed AKA as \n. The paste methods in GB are expecting \n so this line will fix that.
        text = text?.replacingOccurrences(of: String(.paragraphSeparator), with: String(.lineFeed))
        return text
    }

    func saveToDisk(image: UIImage) -> URL? {
        let fileName = "\(ProcessInfo.processInfo.globallyUniqueString)_file.jpg"

        guard let data = image.jpegData(compressionQuality: 0.9) else {
            return nil
        }

        let fileURL = URL(fileURLWithPath: NSTemporaryDirectory()).appendingPathComponent(fileName)

        guard (try? data.write(to: fileURL, options: [.atomic])) != nil else {
            return nil
        }

        return fileURL
    }

    private func readImages(from pasteboard: UIPasteboard) -> [String] {
        guard let images = pasteboard.images else {
            return []
        }
        let imagesURLs = images.compactMap({ saveToDisk(image: $0)?.absoluteString })
        return imagesURLs
    }
    
    override func paste(_ sender: Any?) {
        let start = selectedRange.location
        let end = selectedRange.location + selectedRange.length
        
        let pasteboard = UIPasteboard.general
        let text = readText(from: pasteboard) ?? ""
        let html = readHTML(from: pasteboard) ?? ""
        let imagesURLs = readImages(from: pasteboard)

        onPaste?([
            "currentContent": cleanHTML(),
            "selectionStart": start,
            "selectionEnd": end,
            "pastedText": text,
            "pastedHtml": html,
            "files": imagesURLs] )
    }
    
    // MARK: - Edits
    
    open override func insertText(_ text: String) {
        guard !interceptEnter(text) else {
            return
        }

        super.insertText(text)
        updatePlaceholderVisibility()
    }

    open override func deleteBackward() {
        guard !interceptBackspace() else {
            return
        }
        
        super.deleteBackward()
        updatePlaceholderVisibility()
    }

    // MARK: - Dictation

    override func dictationRecordingDidEnd() {
        isInsertingDictationResult = true
    }

    public override func insertDictationResult(_ dictationResult: [UIDictationPhrase]) {
        let text = dictationResult.reduce("") { $0 + $1.text }
        insertText(text)
        isInsertingDictationResult = false
    }

    // MARK: - Custom Edit Intercepts
    
    private func interceptEnter(_ text: String) -> Bool {
        if text == "\t" {
            return true
        }

        guard text == "\n",
            let onEnter = onEnter else {
                return false
        }

        let caretData = packCaretDataForRN()
        onEnter(caretData)
        return true
    }
    
    private func interceptBackspace() -> Bool {
        guard (isNewLineBeforeSelectionAndNotEndOfContent() && selectedRange.length == 0) || (selectedRange.location == 0 && selectedRange.length == 0),
            let onBackspace = onBackspace else {
                return false
        }
        
        let caretData = packCaretDataForRN()
        onBackspace(caretData)
        return true
    }

    private func isNewLineBeforeSelectionAndNotEndOfContent() -> Bool {
        guard let currentLocation = text.indexFromLocation(selectedRange.location) else {
            return false
        }

        return text.isStartOfParagraph(at: currentLocation) && !(text.endIndex == currentLocation)
    }
    override var keyCommands: [UIKeyCommand]? {
        // Remove defautls Tab and Shift+Tab commands, leaving just Shift+Enter command.
        return [carriageReturnKeyCommand]
    }

    // MARK: - Native-to-RN Value Packing Logic

    private func cleanHTML() -> String {
        let html = getHTML(prettify: false).replacingOccurrences(of: String(.paragraphSeparator), with: String(.lineFeed)).replacingOccurrences(of: String(.zeroWidthSpace), with: "")
        return html
    }
    
    func packForRN(_ text: String, withName name: String) -> [AnyHashable: Any] {
        return [name: text,
                "eventCount": 1]
    }
    
    func packForRN(_ size: CGSize, withName name: String) -> [AnyHashable: Any] {
        
        let size = ["width": size.width,
                    "height": size.height]
        
        return [name: size]
    }
    
    func packCaretDataForRN() -> [AnyHashable: Any] {
        var start = selectedRange.location
        var end = selectedRange.location + selectedRange.length
        if selectionAffinity == .backward {
            (start, end) = (end, start)
        }
        
        var result: [AnyHashable : Any] = packForRN(cleanHTML(), withName: "text")

        result["selectionStart"] = start
        result["selectionEnd"] = end
        
        if let selectedTextRange = selectedTextRange {
            let caretEndRect = caretRect(for: selectedTextRange.end)
            // Sergio Estevao: Sometimes the carectRect can be invalid so we need to check before sending this to JS.
            if !(caretEndRect.isInfinite || caretEndRect.isNull) {
                result["selectionEndCaretX"] = caretEndRect.origin.x
                result["selectionEndCaretY"] = caretEndRect.origin.y
            }
        }

        return result
    }

    // MARK: - RN Properties
    
    @objc
    func setContents(_ contents: NSDictionary) {
        guard contents["eventCount"] == nil else {
            return
        }

        let html = contents["text"] as? String ?? ""

        setHTML(html)
        updatePlaceholderVisibility()
        refreshFont()
        if let selection = contents["selection"] as? NSDictionary,
            let start = selection["start"] as? NSNumber,
            let end = selection["end"]  as? NSNumber {
            setSelection(start: start, end: end)
        }
    }

    // MARK: - Placeholder

    @objc var placeholder: String {
        set {
            var placeholderAttributes = typingAttributes
            placeholderAttributes[.foregroundColor] = placeholderTextColor
            placeholderLabel.attributedText = NSAttributedString(string: newValue, attributes: placeholderAttributes)
        }

        get {
            return placeholderLabel.text ?? ""
        }
    }

    @objc var placeholderTextColor: UIColor {
        set {
            placeholderLabel.textColor = newValue
        }
        get {
            return placeholderLabel.textColor
        }
    }

    @objc var linkTextColor: UIColor {
        set {
            linkTextAttributes = [.foregroundColor: newValue, .underlineStyle: NSNumber(value: NSUnderlineStyle.single.rawValue)]
        }
        get {
            return linkTextAttributes[.foregroundColor] as? UIColor ?? UIColor.blue
        }
    }

    func setSelection(start: NSNumber, end: NSNumber) {
        if let startPosition = position(from: beginningOfDocument, offset: start.intValue),
            let endPosition = position(from: beginningOfDocument, offset: end.intValue) {
            selectedTextRange = textRange(from: startPosition, to: endPosition)
        }
    }
    
    func updatePlaceholderVisibility() {
        placeholderLabel.isHidden = !self.text.replacingOccurrences(of: String(.zeroWidthSpace), with: "").isEmpty
    }
    
    // MARK: - Font Setters
    
    @objc func setFontFamily(_ family: String) {
        fontFamily = family
        refreshFont()
    }
    
    @objc func setFontSize(_ size: CGFloat) {
        fontSize = size
        refreshFont()
    }
    
    @objc func setFontWeight(_ weight: String) {
        fontWeight = weight
        refreshFont()
    }
    
    // MARK: - Font Refreshing
    
    /// Applies the family, size and weight constraints to the provided font.
    ///
    private func applyFontConstraints(to baseFont: UIFont) -> UIFont {
        let oldDescriptor = baseFont.fontDescriptor
        let newFontSize: CGFloat
        
        if let fontSize = fontSize {
            newFontSize = fontSize
        } else {
            newFontSize = baseFont.pointSize
        }
        
        var newTraits = oldDescriptor.symbolicTraits
        
        if let fontWeight = fontWeight {
            if (fontWeight == "bold") {
                newTraits.update(with: .traitBold)
            }
        }
        
        var newDescriptor: UIFontDescriptor
        
        if let fontFamily = fontFamily {
            newDescriptor = UIFontDescriptor(name: fontFamily, size: newFontSize)
            newDescriptor = newDescriptor.withSymbolicTraits(newTraits) ?? newDescriptor
        } else {
            newDescriptor = oldDescriptor
        }
        
        return UIFont(descriptor: newDescriptor, size: newFontSize)
    }
    
    /// Returns the font from the specified attributes, or the default font if no specific one is set.
    ///
    private func font(from attributes: [NSAttributedString.Key: Any]) -> UIFont {
        return attributes[.font] as? UIFont ?? defaultFont
    }
    
    /// This method refreshes the font for the whole view if the font-family, the font-size or the font-weight
    /// were ever set.
    ///
    private func refreshFont() {
        guard fontFamily != nil || fontSize != nil || fontWeight != nil else {
            return
        }
        
        let fullRange = NSRange(location: 0, length: textStorage.length)
        
        textStorage.beginEditing()
        textStorage.enumerateAttributes(in: fullRange, options: []) { (attributes, subrange, stop) in
            let oldFont = font(from: attributes)
            let newFont = applyFontConstraints(to: oldFont)
            
            textStorage.addAttribute(.font, value: newFont, range: subrange)
        }
        textStorage.endEditing()
        
        refreshTypingAttributesAndPlaceholderFont()
    }
    
    /// This method refreshes the font for the palceholder field and typing attributes.
    /// This method should not be called directly.  Call `refreshFont()` instead.
    ///
    private func refreshTypingAttributesAndPlaceholderFont() {
        let oldFont = font(from: typingAttributes)
        let newFont = applyFontConstraints(to: oldFont)
        
        typingAttributes[.font] = newFont
        placeholderLabel.font = newFont
    }

    // MARK: - Formatting interface

    @objc func toggleFormat(format: String) {
        let emptyRange = NSRange(location: selectedRange.location, length: 0)
        switch format {
        case "bold": toggleBold(range: emptyRange)
        case "italic": toggleItalic(range: emptyRange)
        case "strikethrough": toggleStrikethrough(range: emptyRange)
        default: print("Format not recognized")
        }
    }

    func forceTypingAttributesIfNeeded() {
        if let formatHandler = HeadingBlockFormatHandler(block: blockModel) {
            formatHandler.forceTypingFormat(on: self)
        }
    }
    
    // MARK: - Event Propagation
    
    func propagateContentChanges() {
        if let onChange = onChange {
            let text = packForRN(cleanHTML(), withName: "text")
            onChange(text)
        }
    }

    func propagateSelectionChanges() {
        guard let onSelectionChange = onSelectionChange else {
            return
        }
        let caretData = packCaretDataForRN()
        onSelectionChange(caretData)
    }
}

// MARK: UITextView Delegate Methods
extension RCTAztecView: UITextViewDelegate {

    func textViewDidChangeSelection(_ textView: UITextView) {
        guard isInsertingDictationResult == false else {
            return
        }

        propagateSelectionChanges()
    }

    func textViewDidChange(_ textView: UITextView) {
        guard isInsertingDictationResult == false else {
            return
        }

        forceTypingAttributesIfNeeded()
        propagateContentChanges()
        updatePlaceholderVisibility()
        //Necessary to send height information to JS after pasting text.
        textView.setNeedsLayout()
    }

    override func becomeFirstResponder() -> Bool {
        if !isFirstResponder && canBecomeFirstResponder {
            onFocus?([:])
        }
        return super.becomeFirstResponder()
    }

    func textViewDidEndEditing(_ textView: UITextView) {
        onBlur?([:])
    }
}
