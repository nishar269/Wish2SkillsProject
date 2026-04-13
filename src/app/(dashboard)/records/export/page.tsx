"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, FileJson, FileSpreadsheet, FileArchive, ShieldCheck, Database, Trash2, Archive, History } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";

export default function RecordsExportClientPage() {
    const [isExporting, setIsExporting] = useState(false);

    const handleExport = (type: string) => {
        setIsExporting(true);
        setTimeout(() => {
            setIsExporting(false);
            toast.success(`${type} dump generated successfully.`);
        }, 2000);
    };

    return (
        <div className="space-y-8 p-6">
            <div className="flex flex-col gap-2">
                <h1 className="text-4xl font-black italic tracking-tighter text-slate-900 dark:text-white uppercase">System Warehouse</h1>
                <p className="text-slate-500 font-medium italic">Execute large-scale data exports and manage institutional archives.</p>
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
                {/* Export Section */}
                <div className="space-y-6">
                    <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 pl-2">Available Data Exports</h3>
                    <div className="grid gap-4">
                        {[
                            { name: "Student Enrollment", icon: FileSpreadsheet, format: "CSV/Excel", size: "12.4 MB" },
                            { name: "Academic Transcripts", icon: FileArchive, format: "PDF Bundle", size: "45.8 MB" },
                            { name: "Financial Audit", icon: FileJson, format: "JSON", size: "2.1 MB" },
                            { name: "Attendance Logs", icon: History, format: "CSV", size: "8.9 MB" },
                        ].map((exp, i) => (
                            <Card key={i} className="border-0 shadow-lg hover:shadow-xl transition-all rounded-[2rem] overflow-hidden bg-white dark:bg-slate-950 group">
                                <CardContent className="p-6 flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-2xl bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
                                            <exp.icon className="h-6 w-6 text-cyan-600" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-slate-900 dark:text-white">{exp.name}</p>
                                            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{exp.format} • {exp.size}</p>
                                        </div>
                                    </div>
                                    <Button 
                                        onClick={() => handleExport(exp.name)} 
                                        disabled={isExporting}
                                        className="h-10 px-4 bg-slate-900 text-white rounded-xl font-bold text-xs uppercase"
                                    >
                                        Generate
                                    </Button>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>

                {/* Archive Section */}
                <div className="space-y-6">
                    <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 pl-2">Archive Management</h3>
                    <Card className="border-0 shadow-2xl rounded-[3rem] bg-slate-900 text-white p-8 relative overflow-hidden">
                        <div className="relative z-10 space-y-6">
                            <div className="flex items-center gap-3">
                                <Archive className="h-8 w-8 text-cyan-400" />
                                <h2 className="text-2xl font-black italic tracking-tighter uppercase">Cold Storage</h2>
                            </div>
                            <p className="text-slate-400 text-sm leading-relaxed">System archives from previous academic years (2020-2025) are stored here. These records are read-only and encrypted.</p>
                            <div className="p-4 rounded-3xl bg-white/5 border border-white/5 space-y-4">
                                <div className="flex justify-between items-center text-xs">
                                    <span className="font-bold uppercase tracking-widest opacity-50">Storage Used</span>
                                    <span className="font-black">1.2 TB / 5 TB</span>
                                </div>
                                <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                                     <div className="h-full bg-cyan-500 w-[24%]" />
                                </div>
                            </div>
                            <Button className="w-full h-14 bg-white text-slate-900 rounded-2xl font-black uppercase tracking-widest hover:bg-cyan-500 hover:text-white transition-all">
                                Open Archive Vault
                            </Button>
                        </div>
                        <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl -mr-32 -mt-32" />
                    </Card>

                    <Card className="border-0 shadow-lg rounded-[2.5rem] p-8 border-l-[10px] border-l-rose-500 bg-white dark:bg-slate-950">
                        <div className="flex items-center gap-4">
                            <ShieldCheck className="h-8 w-8 text-rose-500" />
                            <div>
                                <h3 className="text-lg font-black uppercase tracking-tighter">Compliance Mode</h3>
                                <p className="text-[11px] text-slate-500 font-medium italic">Automatic data retention policies are active. PII data is anonymized after 7 years.</p>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}
