"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Search, Mail, GraduationCap, Phone, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function FacultyStudentsClientPage({ initialStudents }: { initialStudents: any[] }) {
    const [searchQuery, setSearchQuery] = useState("");

    const filteredStudents = initialStudents.filter(student => 
        student.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.enrollmentNo?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black italic tracking-tighter text-slate-900 dark:text-white uppercase leading-none">Student Directory</h1>
                    <p className="text-slate-500 font-medium italic mt-2">Manage and view profiles of students in your assigned batches.</p>
                </div>
                
                <div className="relative w-full md:w-96 group">
                    <Search className="absolute left-4 top-4 h-5 w-5 text-slate-400 group-focus-within:text-cyan-600 transition-colors" />
                    <Input 
                        placeholder="Search name, email or ID..." 
                        className="h-14 pl-12 rounded-2xl border-0 shadow-lg focus-visible:ring-2 focus-visible:ring-cyan-500/50 dark:bg-slate-950"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {filteredStudents.length === 0 ? (
                    <div className="col-span-full h-64 flex flex-col items-center justify-center text-center bg-slate-50 dark:bg-slate-900 rounded-[3rem] border-2 border-dashed border-slate-200 dark:border-slate-800">
                        <Users className="h-12 w-12 text-slate-300 mb-4" />
                        <p className="text-slate-500 font-bold italic">No students found matching your criteria.</p>
                    </div>
                ) : (
                    filteredStudents.map((student) => (
                        <Card key={student.id} className="group relative overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-500 rounded-[2.5rem] bg-white dark:bg-slate-950">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-cyan-500/15 transition-colors" />
                            
                            <CardHeader className="p-8 pb-4">
                                <div className="flex items-start justify-between">
                                    <Avatar className="h-16 w-16 bg-gradient-to-br from-cyan-500 to-blue-600 border-4 border-white dark:border-slate-900 shadow-xl">
                                        <AvatarFallback className="bg-transparent text-xl font-black text-white">
                                            {student.user.name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)}
                                        </AvatarFallback>
                                    </Avatar>
                                    <Badge className="bg-slate-100 text-slate-600 border-0 px-3 py-1 font-bold text-[10px] uppercase tracking-widest">
                                        {student.batch.name}
                                    </Badge>
                                </div>
                                <div className="mt-6 space-y-1">
                                    <CardTitle className="text-2xl font-black tracking-tighter group-hover:text-cyan-600 transition-colors">
                                        {student.user.name}
                                    </CardTitle>
                                    <p className="text-xs font-black uppercase tracking-widest text-slate-400">
                                        ID: {student.enrollmentNo || "N/A"}
                                    </p>
                                </div>
                            </CardHeader>

                            <CardContent className="p-8 pt-0 space-y-6">
                                <div className="space-y-3">
                                    <div className="flex items-center gap-3 text-sm font-medium text-slate-500">
                                        <Mail className="h-4 w-4 text-cyan-500" />
                                        <span className="truncate">{student.user.email}</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-sm font-medium text-slate-500">
                                        <GraduationCap className="h-4 w-4 text-cyan-500" />
                                        <span>{student.course.name}</span>
                                    </div>
                                    {student.user.phone && (
                                        <div className="flex items-center gap-3 text-sm font-medium text-slate-500">
                                            <Phone className="h-4 w-4 text-cyan-500" />
                                            <span>{student.user.phone}</span>
                                        </div>
                                    )}
                                </div>

                                <div className="pt-4 flex gap-2">
                                    <Button variant="outline" className="flex-1 h-12 rounded-2xl border-2 font-bold hover:bg-cyan-50 hover:border-cyan-200 hover:text-cyan-700 transition-all border-slate-100 dark:border-slate-800" asChild>
                                        <a href={`mailto:${student.user.email}`}>Contact Student</a>
                                    </Button>
                                    <Button variant="ghost" size="icon" className="h-12 w-12 rounded-2xl bg-slate-50 dark:bg-slate-900 hover:bg-cyan-500 hover:text-white transition-all group/btn">
                                        <ExternalLink className="h-5 w-5 group-hover/btn:scale-110" />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
}

function Users({ className }: { className?: string }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
        >
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M23 7a4 4 0 0 0-4 4v.5" />
        </svg>
    )
}
