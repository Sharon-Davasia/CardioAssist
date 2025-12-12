import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select";
import { UserPlus } from "lucide-react";
import { cn } from "@/lib/utils";

// Staff list - in production this would come from database
export const STAFF_LIST = [
  { id: 'dr-smith', name: 'Dr. Smith', role: 'Physician', specialty: 'Emergency Medicine' },
  { id: 'dr-johnson', name: 'Dr. Johnson', role: 'Physician', specialty: 'Cardiology' },
  { id: 'dr-patel', name: 'Dr. Patel', role: 'Physician', specialty: 'Internal Medicine' },
  { id: 'dr-lee', name: 'Dr. Lee', role: 'Physician', specialty: 'Emergency Medicine' },
  { id: 'dr-chen', name: 'Dr. Chen', role: 'Physician', specialty: 'Pulmonology' },
  { id: 'nurse-williams', name: 'RN Williams', role: 'Nurse', specialty: 'Triage' },
  { id: 'nurse-garcia', name: 'RN Garcia', role: 'Nurse', specialty: 'Critical Care' },
  { id: 'nurse-brown', name: 'RN Brown', role: 'Nurse', specialty: 'Cardiac' },
  { id: 'nurse-davis', name: 'RN Davis', role: 'Nurse', specialty: 'Emergency' },
  { id: 'nurse-martinez', name: 'RN Martinez', role: 'Nurse', specialty: 'Pediatric' },
];

interface StaffAssignmentDropdownProps {
  currentAssignment?: string;
  onAssign: (staffName: string) => void;
  size?: 'sm' | 'default';
  showIcon?: boolean;
  placeholder?: string;
  filterRole?: 'Physician' | 'Nurse' | 'all';
}

export const StaffAssignmentDropdown = ({
  currentAssignment,
  onAssign,
  size = 'default',
  showIcon = true,
  placeholder = 'Assign to...',
  filterRole = 'all'
}: StaffAssignmentDropdownProps) => {
  const filteredStaff = filterRole === 'all' 
    ? STAFF_LIST 
    : STAFF_LIST.filter(s => s.role === filterRole);

  const handleSelect = (staffId: string) => {
    const staff = STAFF_LIST.find(s => s.id === staffId);
    if (staff) {
      onAssign(staff.name);
    }
  };

  // Find current staff ID if assigned
  const currentStaffId = STAFF_LIST.find(s => s.name === currentAssignment)?.id;

  return (
    <Select value={currentStaffId || ''} onValueChange={handleSelect}>
      <SelectTrigger className={cn(
        "min-w-0",
        size === 'sm' ? 'h-8 text-xs w-auto min-w-[140px] max-w-[180px]' : 'w-[200px]'
      )}>
        <div className="flex items-center gap-1.5 truncate overflow-hidden w-full">
          {showIcon && <UserPlus className="h-3 w-3 flex-shrink-0" />}
          <span className="truncate flex-1 text-left">
            {currentStaffId ? STAFF_LIST.find(s => s.id === currentStaffId)?.name || placeholder : placeholder}
          </span>
        </div>
      </SelectTrigger>
      <SelectContent className="z-50 bg-background max-h-[300px] overflow-y-auto min-w-[200px]">
        <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground border-b mb-1">
          Physicians
        </div>
        {filteredStaff.filter(s => s.role === 'Physician').map((staff) => (
          <SelectItem key={staff.id} value={staff.id} className="cursor-pointer">
            <div className="flex flex-col">
              <span className="font-medium">{staff.name}</span>
              <span className="text-xs text-muted-foreground">{staff.specialty}</span>
            </div>
          </SelectItem>
        ))}
        {(filterRole === 'all' || filterRole === 'Nurse') && (
          <>
            <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground border-b border-t mt-1 mb-1">
              Nurses
            </div>
            {filteredStaff.filter(s => s.role === 'Nurse').map((staff) => (
              <SelectItem key={staff.id} value={staff.id} className="cursor-pointer">
                <div className="flex flex-col">
                  <span className="font-medium">{staff.name}</span>
                  <span className="text-xs text-muted-foreground">{staff.specialty}</span>
                </div>
              </SelectItem>
            ))}
          </>
        )}
      </SelectContent>
    </Select>
  );
};

export default StaffAssignmentDropdown;