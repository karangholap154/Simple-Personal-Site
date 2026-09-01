import os
from PIL import Image

GALLERY_DIR = os.path.abspath("src/assets/gallery")
PROFILE_SRC = os.path.abspath("src/assets/profile.png")
PROFILE_PUB = os.path.abspath("public/profile.png")

def optimize_gallery():
    print(f"--- Optimizing Gallery Images in {GALLERY_DIR} ---")
    files = [f for f in os.listdir(GALLERY_DIR) if f.lower().endswith(('.jpg', '.jpeg', '.png'))]
    
    total_orig = 0
    total_new = 0
    
    for filename in sorted(files):
        filepath = os.path.join(GALLERY_DIR, filename)
        orig_size = os.path.getsize(filepath)
        total_orig += orig_size
        
        base_name = os.path.splitext(filename)[0]
        # Fix typo if present
        if base_name == "18-beach-veiw":
            base_name = "18-beach-view"
            
        out_filename = f"{base_name}.webp"
        out_filepath = os.path.join(GALLERY_DIR, out_filename)
        
        with Image.open(filepath) as img:
            # Handle EXIF orientation if present
            try:
                from PIL import ImageOps
                img = ImageOps.exif_transpose(img)
            except Exception:
                pass
                
            # Convert palette/CMYK to RGB/RGBA
            if img.mode in ("P", "CMYK"):
                img = img.convert("RGBA" if "transparency" in img.info else "RGB")
            elif img.mode not in ("RGB", "RGBA"):
                img = img.convert("RGB")
                
            # Downscale if larger than 2048px on longest side
            max_dim = 2048
            w, h = img.size
            if max(w, h) > max_dim:
                if w > h:
                    new_w = max_dim
                    new_h = int(h * (max_dim / w))
                else:
                    new_h = max_dim
                    new_w = int(w * (max_dim / h))
                img = img.resize((new_w, new_h), Image.Resampling.LANCZOS)
                
            # Save WebP @ quality 90 for pristine HD visual output
            img.save(out_filepath, "WEBP", quality=90, method=6)
            
        new_size = os.path.getsize(out_filepath)
        total_new += new_size
        
        print(f"  {filename} ({orig_size / (1024*1024):.2f} MB) -> {out_filename} ({new_size / 1024:.1f} KB) [{(1 - new_size/orig_size)*100:.1f}% reduced]")
        
        # Remove original heavy file if out_filepath != filepath
        if filepath != out_filepath and os.path.exists(out_filepath):
            os.remove(filepath)

    if total_orig > 0:
        print(f"\nGallery Total: {total_orig / (1024*1024):.2f} MB -> {total_new / (1024*1024):.2f} MB (Saved {(1 - total_new/total_orig)*100:.1f}%)")

def optimize_profile():
    print("\n--- Optimizing Profile Image ---")
    for path in [PROFILE_SRC, PROFILE_PUB]:
        if os.path.exists(path):
            orig_size = os.path.getsize(path)
            with Image.open(path) as img:
                img = img.convert("RGBA")
                img = img.resize((512, 512), Image.Resampling.LANCZOS)
                img.save(path, "PNG", optimize=True)
            new_size = os.path.getsize(path)
            print(f"  {os.path.basename(path)}: {orig_size / (1024*1024):.2f} MB -> {new_size / 1024:.1f} KB")

if __name__ == "__main__":
    optimize_gallery()
    optimize_profile()
