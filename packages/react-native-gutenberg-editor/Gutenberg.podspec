package = JSON.parse(File.read(File.join(__dir__, 'package.json')))
# Use the same RN version that the JS tools use
react_native_version = package['dependencies']['react-native']
# Extract the tagged version if package.json points to a tag
react_native_version = react_native_version.split("#v").last if react_native_version.include? "#v"

Pod::Spec.new do |s|
  s.name             = 'Gutenberg'
  s.version          = package['version']
  s.summary          = 'Printing since 1440'
  s.homepage     = 'https://github.com/WordPress/gutenberg'
  s.license      = package['license']
  s.authors          = 'Automattic'
  s.platform     = :ios, '10.0'
  s.source       = { :git => 'https://github.com/WordPress/gutenberg.git' }
  s.source_files = 'packages/react-native-gutenberg-bridge/ios/*.{h,m,swift}'
  s.requires_arc = true
  s.preserve_paths = 'bundle/ios/*'
  s.swift_version = '4.2'

  s.dependency 'React', react_native_version
  s.dependency 'React-RCTImage', react_native_version

  s.dependency 'WordPress-Aztec-iOS'
  s.dependency 'RNTAztecView'
end
