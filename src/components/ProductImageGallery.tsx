
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ZoomIn } from "lucide-react";

interface ProductImage {
  id: string;
  url: string;
  alt: string;
  color: string;
}

interface ProductImageGalleryProps {
  images: ProductImage[];
  selectedColor: string;
}

export default function ProductImageGallery({ images, selectedColor }: ProductImageGalleryProps) {
  const [selectedImage, setSelectedImage] = useState(images[0]);

  const filteredImages = selectedColor ?
  images.filter((img) => img.color === selectedColor) :
  images;

  const currentImage = filteredImages.find((img) => img.color === selectedColor) || images[0];

  return (
    <div className="space-y-4">
      <div className="relative">
        <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
          <img
            src={currentImage.url}
            alt={currentImage.alt}
            className="w-full h-full object-cover" />

        </div>
        <Button
          variant="outline"
          size="icon"
          className="absolute top-4 right-4 bg-white/90 hover:bg-white">

          <ZoomIn className="h-4 w-4" />
        </Button>
      </div>
      
      {filteredImages.length > 1 &&
      <div className="grid grid-cols-4 gap-2">
          {filteredImages.map((image) =>
        <button
          key={image.id}
          onClick={() => setSelectedImage(image)}
          className={`aspect-square bg-gray-100 rounded-lg overflow-hidden border-2 transition-colors ${
          selectedImage.id === image.id ? 'border-green-500' : 'border-transparent'}`
          }>

              <img
            src={image.url}
            alt={image.alt}
            className="w-full h-full object-cover" />

            </button>
        )}
        </div>
      }
    </div>);

}