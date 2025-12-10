"""
Convert avatar.png to favicon.ico
"""
from PIL import Image

# Open the avatar image
img = Image.open('images/avatar.png')

# Convert to RGB if necessary (ICO format doesn't support RGBA well)
if img.mode == 'RGBA':
    # Create a white background
    background = Image.new('RGB', img.size, (255, 255, 255))
    background.paste(img, mask=img.split()[3])  # Use alpha channel as mask
    img = background
elif img.mode != 'RGB':
    img = img.convert('RGB')

# Create multiple sizes for favicon (16x16, 32x32, 48x48)
sizes = [(16, 16), (32, 32), (48, 48)]
icons = []

for size in sizes:
    # Resize with high-quality resampling
    resized = img.resize(size, Image.Resampling.LANCZOS)
    icons.append(resized)

# Save as favicon.ico with multiple sizes
icons[0].save('favicon.ico', format='ICO', sizes=[(16, 16), (32, 32), (48, 48)], append_images=icons[1:])

print("✓ Created favicon.ico from avatar.png")
print("  Sizes included: 16x16, 32x32, 48x48")
