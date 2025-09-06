import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"

export default function TestPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-2xl mx-auto space-y-8">
        <div className="flex justify-between items-center">
          <h1 className="text-4xl font-bold text-gray-900">
            🎨 CSS Test Page
          </h1>
          <div className="space-x-2">
            <Button asChild variant="outline">
              <Link href="/login">Login</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/dashboard">Dashboard</Link>
            </Button>
          </div>
        </div>
        
        <div className="test-css-working">
          🚀 Se vedi questo box con gradiente colorato, il CSS funziona!
        </div>
        
        <Card className="border shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl text-blue-600">Test Card</CardTitle>
            <CardDescription>
              This is a test to see if Tailwind CSS and shadcn/ui components are working
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-700">
              Se vedi questo testo stilizzato con colori e spaziature, allora CSS funziona!
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button className="w-full">
                Primary Button
              </Button>
              <Button variant="outline" className="w-full">
                Outline Button
              </Button>
            </div>
            
            <div className="p-4 bg-green-100 border-l-4 border-green-500 rounded">
              <p className="text-green-800 font-medium">
                ✅ Se vedi questo box verde con bordo, CSS funziona!
              </p>
            </div>
            
            <div className="p-4 bg-red-100 border border-red-300 rounded-lg">
              <p className="text-red-800">
                🔴 Se questo è solo testo senza colori/stili, CSS non funziona!
              </p>
            </div>
            
            <div className="p-4 bg-yellow-100 border border-yellow-300 rounded-lg">
              <p className="text-yellow-800">
                ⚠️ Debug info: Se non vedi stili, controlla DevTools → Network tab per CSS files
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="text-center space-y-4">
          <p className="text-lg text-gray-600">
            Test delle classi Tailwind:
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            <span className="px-3 py-1 bg-red-500 text-white rounded-full text-sm">Red</span>
            <span className="px-3 py-1 bg-blue-500 text-white rounded-full text-sm">Blue</span>
            <span className="px-3 py-1 bg-green-500 text-white rounded-full text-sm">Green</span>
            <span className="px-3 py-1 bg-yellow-500 text-black rounded-full text-sm">Yellow</span>
            <span className="px-3 py-1 bg-purple-500 text-white rounded-full text-sm">Purple</span>
          </div>
        </div>

        <div className="text-center">
          <p className="text-sm text-gray-500 mb-4">
            Vai su /test per vedere questa pagina di test
          </p>
        </div>
      </div>
    </div>
  )
}