import { getAuditLogs } from "@/actions/audit";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ShieldAlert, Fingerprint, Activity, Clock, User as UserIcon } from "lucide-react";
import { format } from "date-fns";

export const dynamic = "force-dynamic";

export default async function AuditLogsPage() {
  const logs = await getAuditLogs();

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight italic">System Fortress</h1>
          <p className="text-muted-foreground italic">Immutable activity logs and administrative audit trail.</p>
        </div>
        <div className="flex items-center gap-2 p-1.5 bg-red-50 dark:bg-red-950/30 rounded-full border border-red-100 pr-4">
            <div className="p-2 bg-red-500 rounded-full text-white">
                <ShieldAlert className="h-4 w-4" />
            </div>
            <span className="text-xs font-bold text-red-700">Security Monitoring Active</span>
        </div>
      </div>

      <Card className="border-0 shadow-2xl">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50/50 dark:bg-slate-900/50">
                <TableHead>Event Trace</TableHead>
                <TableHead>Principal</TableHead>
                <TableHead>Resource</TableHead>
                <TableHead>Timestamp</TableHead>
                <TableHead className="text-right">Activity</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-40 text-center text-muted-foreground italic">
                    All clear. No audit records found.
                  </TableCell>
                </TableRow>
              ) : (
                logs.map((log) => (
                  <TableRow key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-950/50 transition-colors">
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Activity className={`h-4 w-4 ${
                            log.action === 'DELETE' ? 'text-red-500' : 
                            log.action === 'CREATE' ? 'text-emerald-500' : 'text-blue-500'
                        }`} />
                        <span className="text-[10px] font-black uppercase tracking-widest">{log.action}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                         <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                            <UserIcon className="h-3.5 w-3.5 text-slate-500" />
                         </div>
                         <div>
                            <p className="text-sm font-bold">{log.user.name}</p>
                            <p className="text-[10px] text-muted-foreground uppercase">{log.user.role}</p>
                         </div>
                      </div>
                    </TableCell>
                    <TableCell>
                       <div className="space-y-1">
                          <Badge variant="outline" className="text-[9px] uppercase font-bold">{log.entity}</Badge>
                          <p className="text-xs text-muted-foreground italic font-medium">{log.details || "No metadata provided"}</p>
                       </div>
                    </TableCell>
                    <TableCell className="text-[11px] text-muted-foreground font-mono">
                       <Clock className="h-3 w-3 inline mr-1 opacity-50" />
                       {format(new Date(log.createdAt), "MMM dd, HH:mm:ss")}
                    </TableCell>
                    <TableCell className="text-right">
                       <div className="p-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg inline-block">
                          <Fingerprint className="h-3.5 w-3.5 text-slate-400" />
                       </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
