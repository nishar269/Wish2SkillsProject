import { auth } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { MapPin, Info, ArrowUpRight, School, Navigation } from "lucide-react";
import { Button } from "@/components/ui/button";

export default async function CampusMapPage() {
  const session = await auth();

  // Campus Center (Mock Bangalore Coords)
  const CAMPUS_LAT = 12.9716;
  const CAMPUS_LNG = 77.5946;

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Interactive Campus Map</h1>
          <p className="text-muted-foreground">Find your way around Wish2Skill Headquarters.</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
            <Navigation className="h-4 w-4 mr-2" /> Navigate Here
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 overflow-hidden border-0 shadow-2xl rounded-3xl group">
            <div className="relative w-full h-[500px] bg-slate-200 dark:bg-slate-900 group-hover:scale-[1.02] transition-transform duration-700">
                {/* Embed a Google Map iframe or placeholder */}
                <iframe 
                    width="100%" 
                    height="100%" 
                    frameBorder="0" 
                    scrolling="no" 
                    marginHeight={0} 
                    marginWidth={0} 
                    src={`https://maps.google.com/maps?q=${CAMPUS_LAT},${CAMPUS_LNG}&z=15&output=embed`}
                    className="filter grayscale-[0.5] contrast-[1.1] invert-[0] dark:invert-[0.9] transition-all"
                ></iframe>
                
                <div className="absolute bottom-6 left-6 p-4 bg-white/95 dark:bg-slate-950/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 max-w-xs">
                    <div className="flex gap-3">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-xl text-blue-600">
                            <MapPin className="h-5 w-5" />
                        </div>
                        <div>
                            <p className="text-xs font-black uppercase tracking-widest text-blue-600">Main Campus</p>
                            <p className="text-sm font-bold text-slate-800 dark:text-slate-100">Wish2Skill Tech Park</p>
                            <p className="text-[10px] text-muted-foreground mt-1 line-clamp-2">24/A, Innovation Drive, Tech Corridor, Bangalore, KA - 560001</p>
                        </div>
                    </div>
                </div>
            </div>
        </Card>

        <div className="space-y-6">
            <Card className="border-0 shadow-lg bg-gradient-to-br from-slate-900 to-slate-800 text-white">
                <CardHeader>
                    <div className="p-3 bg-white/10 w-fit rounded-2xl mb-2">
                        <Info className="h-6 w-6 text-blue-400" />
                    </div>
                    <CardTitle className="text-xl">Campus Geo-Pulse</CardTitle>
                    <CardDescription className="text-slate-400">Security & Attendance Compliance</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="p-4 bg-white/5 rounded-2xl space-y-2">
                        <div className="flex justify-between text-xs">
                            <span className="text-slate-400">Attendance Radius</span>
                            <span className="font-bold">500 Meters</span>
                        </div>
                        <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                            <div className="h-full bg-blue-500 w-[500/500 * 100%]" />
                        </div>
                    </div>
                    <p className="text-xs leading-relaxed text-slate-400 italic">
                        &ldquo;To ensure academic integrity, student self-marking is only permitted within the verified campus perimeter. Please ensure GPS is enabled when marking presence.&rdquo;
                    </p>
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 gap-4">
                {[
                    { name: "Academic Block A", detail: "CS & IT Dept", floor: "G, 1, 2" },
                    { name: "Innovation Lab", detail: "AI & Robotics", floor: "B1" },
                    { name: "Central Library", detail: "24/7 Access", floor: "3, 4" },
                ].map((loc, i) => (
                    <div key={i} className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 flex items-center justify-between hover:bg-slate-50 transition-colors">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-500">
                                <School className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="text-sm font-bold">{loc.name}</p>
                                <p className="text-[10px] text-muted-foreground">{loc.detail}</p>
                            </div>
                        </div>
                        <Badge variant="secondary" className="text-[9px] uppercase">{loc.floor}</Badge>
                    </div>
                ))}
            </div>
        </div>
      </div>
    </div>
  );
}
