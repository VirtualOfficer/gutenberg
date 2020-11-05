import Aztec
import Foundation

@objc (RCTAztecViewManager)
public class RCTAztecViewManager: RCTViewManager {

    public var attachmentDelegate: Aztec.TextViewAttachmentDelegate?
    public var imageProvider: Aztec.TextViewAttachmentImageProvider?
    public lazy var unsupportedHTMLImageProvider = {
        Aztec.HTMLAttachmentRenderer(font: defaultFont)
    }()

    public override static func requiresMainQueueSetup() -> Bool {
        return true
    }

    @objc
    public override func view() -> UIView {
        let view = RCTAztecView(
            defaultFont: defaultFont,
            defaultParagraphStyle: defaultParagrahStyle,
            defaultMissingImage: UIImage())

        view.isScrollEnabled = false

        view.textAttachmentDelegate = attachmentDelegate
        
        if let imageProvider = imageProvider {
            view.registerAttachmentImageProvider(imageProvider)
        }
        
        view.registerAttachmentImageProvider(unsupportedHTMLImageProvider)

        return view
    }

    func executeBlock(_ block: @escaping (RCTAztecView) -> Void, onNode node: NSNumber) {
        self.bridge.uiManager.addUIBlock { (manager, viewRegistry) in
            let view = viewRegistry?[node]
            guard let aztecView = view as? RCTAztecView else {
                return
            }
            block(aztecView)
        }
    }

    private var defaultFont: UIFont {        
        if let font = UIFont(name: "NotoSerif", size: 16) {
            return font
        }

        let defaultFont = UIFont.systemFont(ofSize: 16)
        guard let url = Bundle.main.url(forResource: "NotoSerif-Regular", withExtension: "ttf") else {
            return defaultFont
        }
        CTFontManagerRegisterFontsForURL(url as CFURL, CTFontManagerScope.process, nil)
        if let font = UIFont(name: "NotoSerif", size: 16) {
            return font
        }

        return defaultFont
    }
    private var defaultParagrahStyle: ParagraphStyle {
        let defaultStyle = ParagraphStyle.default
        defaultStyle.textListParagraphSpacing = 5
        defaultStyle.textListParagraphSpacingBefore = 5
        return defaultStyle
    }
}
