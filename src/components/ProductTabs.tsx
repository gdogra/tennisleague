
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ProductTabsProps {
  description: string;
  additionalInfo: Record<string, string>;
  specifications?: Record<string, any>;
  features?: string;
}

export default function ProductTabs({
  description,
  additionalInfo,
  specifications = {},
  features
}: ProductTabsProps) {
  return (
    <Tabs defaultValue="description" className="w-full">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="description">Description</TabsTrigger>
        <TabsTrigger value="additional">Additional Info</TabsTrigger>
        <TabsTrigger value="specifications">Specifications</TabsTrigger>
        <TabsTrigger value="features">Features</TabsTrigger>
      </TabsList>
      
      <TabsContent value="description" className="mt-6">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Description</h3>
          <p className="text-gray-600 leading-relaxed">{description}</p>
        </div>
      </TabsContent>
      
      <TabsContent value="additional" className="mt-6">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Additional information</h3>
          <div className="border rounded-lg">
            <table className="w-full">
              <tbody>
                {Object.entries(additionalInfo).map(([key, value], index) =>
                <tr key={key} className={index % 2 === 0 ? "bg-gray-50" : ""}>
                    <th className="text-left p-3 border-b font-medium text-gray-700 w-1/3">
                      {key}
                    </th>
                    <td className="p-3 border-b text-gray-600">
                      {value}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </TabsContent>

      <TabsContent value="specifications" className="mt-4">
        <div className="bg-gray-50 p-4 rounded-lg">
          {Object.keys(specifications).length > 0 ?
          <div className="space-y-2">
              {Object.entries(specifications).map(([key, value]) =>
            <div key={key} className="flex justify-between py-2 border-b border-gray-200 last:border-b-0">
                  <span className="font-medium text-gray-700">{key}:</span>
                  <span className="text-gray-600">{typeof value === 'object' ? JSON.stringify(value) : value}</span>
                </div>
            )}
            </div> :

          <p className="text-gray-600">No specifications available.</p>
          }
        </div>
      </TabsContent>

      <TabsContent value="features" className="mt-4">
        <div className="bg-gray-50 p-4 rounded-lg">
          {features && features.trim() !== '' ?
          <div className="prose text-gray-600" dangerouslySetInnerHTML={{ __html: features.replace(/\n/g, '<br>') }} /> :

          <p className="text-gray-600">No features information available.</p>
          }
        </div>
      </TabsContent>
    </Tabs>);


}