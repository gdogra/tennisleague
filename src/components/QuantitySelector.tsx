
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Minus, Plus } from "lucide-react";

interface QuantitySelectorProps {
  quantity: number;
  onQuantityChange: (quantity: number) => void;
  min?: number;
  max?: number;
}

export default function QuantitySelector({
  quantity,
  onQuantityChange,
  min = 1,
  max = 99
}: QuantitySelectorProps) {
  const handleIncrement = () => {
    if (quantity < max) {
      onQuantityChange(quantity + 1);
    }
  };

  const handleDecrement = () => {
    if (quantity > min) {
      onQuantityChange(quantity - 1);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value >= min && value <= max) {
      onQuantityChange(value);
    }
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="quantity" className="text-sm font-medium">Quantity</Label>
      <div className="flex items-center space-x-2">
        <Button
          variant="outline"
          size="icon"
          onClick={handleDecrement}
          disabled={quantity <= min}
          className="h-9 w-9">

          <Minus className="h-3 w-3" />
        </Button>
        <Input
          id="quantity"
          type="number"
          min={min}
          max={max}
          value={quantity}
          onChange={handleInputChange}
          className="w-16 text-center" />

        <Button
          variant="outline"
          size="icon"
          onClick={handleIncrement}
          disabled={max ? quantity >= max : false}
          className="h-9 w-9">

          <Plus className="h-3 w-3" />
        </Button>
      </div>
    </div>);

}