import { Phone, AlertTriangle } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import type { Student } from "@/lib/types";

interface ContactCardProps {
  student: Student;
  showBadge?: boolean;
}

export function ContactCard({ student, showBadge = false }: ContactCardProps) {
  return (
    <div className="flex items-center gap-3 p-3 bg-white rounded-lg border">
      <Avatar className="h-10 w-10">
        <AvatarImage
          src="/placeholder.svg?height=40&width=40"
          alt={student.fullName}
        />
        <AvatarFallback>{student.fullName.charAt(0)}</AvatarFallback>
      </Avatar>

      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className="font-medium text-orange-500">
            {student.fullName}
          </span>
          {showBadge && !student.hasConsent && (
            <Badge variant="destructive" className="text-xs">
              <AlertTriangle className="h-3 w-3 mr-1" />
              No consent for ads
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-1 text-sm text-gray-600">
          <Phone className="h-3 w-3" />
          {student.phone}
        </div>
      </div>
    </div>
  );
}
