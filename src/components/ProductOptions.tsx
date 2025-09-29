
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface ProductOptionsProps {
  selectedColor: string;
  selectedSize: string;
  onColorChange: (color: string) => void;
  onSizeChange: (size: string) => void;
  colorOptions?: string[];
  sizeOptions?: string[];
}

const colors = [
{ value: "bright-blue", label: "Bright Blue" },
{ value: "grey", label: "Grey" },
{ value: "white", label: "White" }];


const sizes = [
{ value: "medium", label: "Medium" },
{ value: "large", label: "Large" },
{ value: "xlarge", label: "XLarge" }];


export default function ProductOptions({
  selectedColor,
  selectedSize,
  onColorChange,
  onSizeChange
}: ProductOptionsProps) {
  return (
    <div className="space-y-6">
      {/* Color Selection */}
      {colorOptions.length > 0 &&
      <div>
          <h3 className="text-sm font-medium text-gray-900 mb-3">Color</h3>
          <div className="flex flex-wrap gap-3">
            {colorOptions.map((color) =>
          <button
            key={color}
            onClick={() => onColorChange(color)}
            className={`w-8 h-8 rounded-full border-2 transition-all ${
            selectedColor === color ?
            'border-gray-900 scale-110' :
            'border-gray-300 hover:border-gray-400'} ${
            getColorClass(color)}`}
            title={color.charAt(0).toUpperCase() + color.slice(1).replace('-', ' ')} />

          )}
          </div>
        </div>
      }

      {/* Size Selection */}
      {sizeOptions.length > 0 &&
      <div>
          <h3 className="text-sm font-medium text-gray-900 mb-3">Size</h3>
          <div className="flex flex-wrap gap-2">
            {sizeOptions.map((size) =>
          <button
            key={size}
            onClick={() => onSizeChange(size)}
            className={`py-2 px-3 text-sm font-medium rounded-md border transition-colors ${
            selectedSize === size ?
            'border-gray-900 bg-gray-900 text-white' :
            'border-gray-300 bg-white text-gray-900 hover:border-gray-400'}`
            }>

                {size}
              </button>
          )}
          </div>
        </div>
      }
    </div>);


}