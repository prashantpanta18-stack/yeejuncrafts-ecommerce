import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gray-50 text-black gap-6">
      <div className="text-center">
        <h1 className="text-5xl font-bold text-blue-900">YEEJUNCRAFTS</h1>
        <p className="mt-4 text-xl">Global Handmade E-Commerce Platform</p>
      </div>

      {/* यो shadcn को तयार भएको सुन्दर बटन हो */}
      <Button size="lg" className="bg-blue-900 hover:bg-blue-800 text-white">
        Explore Products
      </Button>
    </main>
  );
}
