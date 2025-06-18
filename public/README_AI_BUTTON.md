# AI Button Icon

Please place your `ai_button.png` file in this `/public/` directory.

The FloatingAssistant component expects this image at `/ai_button.png` and will:
- Display the custom icon in the floating action button (32x32px)
- Display the custom icon in the dialog header avatar (24x24px) 
- Display the custom icon in message avatars (20x20px)
- Fall back to the default Material-UI SmartToy icon if the image fails to load

## Recommended specifications:
- **Format**: PNG with transparency
- **Size**: 64x64px or higher (will be scaled down)
- **Style**: Should work well on both light and dark backgrounds
- **Colors**: Should be visible against the blue gradient background of the floating button