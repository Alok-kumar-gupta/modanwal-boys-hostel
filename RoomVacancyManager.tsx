/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect } from 'react';
import { 
  Home, 
  Bed, 
  Users, 
  UserCheck, 
  UserX, 
  Plus, 
  Search, 
  Filter, 
  Edit3, 
  Trash2, 
  CheckCircle, 
  AlertCircle, 
  Phone, 
  MessageSquare, 
  Wrench, 
  ArrowRightLeft, 
  Sparkles, 
  DollarSign, 
  Building, 
  Layers, 
  X, 
  Save, 
  Check, 
  UserPlus, 
  FileText,
  Clock,
  Shield,
  GraduationCap,
  Sliders,
  ChevronDown,
  ChevronUp,
  LayoutGrid,
  Table as TableIcon,
  Tag,
  Info,
  CheckSquare,
  Square,
  RefreshCw,
  Zap,
  Lock,
  Unlock
} from 'lucide-react';
import { BookingInquiry, HostelConfig, HostelRoom } from '../types';

interface RoomVacancyManagerProps {
  bookings: BookingInquiry[];
  config: HostelConfig;
  onUpdateBooking: (updated: BookingInquiry) => void;
  onUpdateConfig: (newConfig: HostelConfig) => void;
  onOpenStudentDashboard?: (studentId: string) => void;
  onAddStudentToRoom?: (roomNumber: string, roomType: 'single' | 'twin' | 'full') => void;
}

// Default standard hostel room layout if owner hasn't customized
const DEFAULT_HOSTEL_ROOMS: HostelRoom[] = [
  // Ground Floor
  { id: '101', roomNumber: '101', floor: 'Ground Floor (ग्राउंड फ्लोर)', type: 'single', capacity: 1, status: 'available', notes: 'Near Lobby / Main Gate', amenities: ['Attached Washroom', 'Wi-Fi Router Nearby'] },
  { id: '102', roomNumber: '102', floor: 'Ground Floor (ग्राउंड फ्लोर)', type: 'twin', capacity: 2, status: 'available', notes: 'Spacious window ventilation', amenities: ['Sunlight Facing', 'Study Table'] },
  { id: '103', roomNumber: '103', floor: 'Ground Floor (ग्राउंड फ्लोर)', type: 'twin', capacity: 2, status: 'available', notes: 'Quiet study side', amenities: ['Quiet Side', 'Cooler Space'] },
  { id: '104', roomNumber: '104', floor: 'Ground Floor (ग्राउंड फ्लोर)', type: 'single', capacity: 1, status: 'available', notes: 'Attached washroom access', amenities: ['Attached Washroom'] },
  { id: '105', roomNumber: '105', floor: 'Ground Floor (ग्राउंड फ्लोर)', type: 'twin', capacity: 2, status: 'available', notes: 'Garden view', amenities: ['Garden View', 'Study Table'] },
  { id: '106', roomNumber: '106', floor: 'Ground Floor (ग्राउंड फ्लोर)', type: 'twin', capacity: 2, status: 'available', notes: 'Near kitchen dining area', amenities: ['Near Dining'] },

  // 1st Floor
  { id: '201', roomNumber: '201', floor: '1st Floor (प्रथम तल)', type: 'single', capacity: 1, status: 'available', notes: 'Balcony access corner room', amenities: ['Attached Balcony', 'Sunlight Facing'] },
  { id: '202', roomNumber: '202', floor: '1st Floor (प्रथम तल)', type: 'twin', capacity: 2, status: 'available', notes: '2-Seater with double study desks', amenities: ['Double Desks', 'Wi-Fi Router Nearby'] },
  { id: '203', roomNumber: '203', floor: '1st Floor (प्रथम तल)', type: 'twin', capacity: 2, status: 'available', notes: 'Sunlight facing window', amenities: ['Sunlight Facing', 'Cross Ventilation'] },
  { id: '204', roomNumber: '204', floor: '1st Floor (प्रथम तल)', type: 'single', capacity: 1, status: 'available', notes: 'Peaceful corner single', amenities: ['Quiet Side', 'Cooler Space'] },
  { id: '205', roomNumber: '205', floor: '1st Floor (प्रथम तल)', type: 'twin', capacity: 2, status: 'available', notes: 'Twin sharing deluxe', amenities: ['Spacious Wardrobe'] },
  { id: '206', roomNumber: '206', floor: '1st Floor (प्रथम तल)', type: 'twin', capacity: 2, status: 'available', notes: 'High-speed Wi-Fi router nearby', amenities: ['Wi-Fi Router Nearby'] },

  // 2nd Floor
  { id: '301', roomNumber: '301', floor: '2nd Floor (द्वितीय तल)', type: 'single', capacity: 1, status: 'available', notes: 'Top floor quiet zone', amenities: ['Quiet Side', 'Terrace Access'] },
  { id: '302', roomNumber: '302', floor: '2nd Floor (द्वितीय तल)', type: 'twin', capacity: 2, status: 'available', notes: 'Terrace entry adjacent', amenities: ['Terrace Access', 'Cooler Space'] },
  { id: '303', roomNumber: '303', floor: '2nd Floor (द्वितीय तल)', type: 'twin', capacity: 2, status: 'available', notes: 'Cool cross ventilation', amenities: ['Cross Ventilation', 'Sunlight Facing'] },
  { id: '304', roomNumber: '304', floor: '2nd Floor (द्वितीय तल)', type: 'single', capacity: 1, status: 'available', notes: 'Single room 2nd floor', amenities: ['Study Table'] },
  { id: '305', roomNumber: '305', floor: '2nd Floor (द्वितीय तल)', type: 'twin', capacity: 2, status: 'available', notes: '2-Seater room', amenities: ['Spacious'] },
];

const COMMON_AMENITIES_OPTIONS = [
  'Attached Balcony',
  'Attached Washroom',
  'Sunlight Facing',
  'Cross Ventilation',
  'Wi-Fi Router Nearby',
  'Cooler Space',
  'AC Provision',
  'Study Table',
  'Quiet Side',
  'Terrace Access'
];

export default function RoomVacancyManager({
  bookings,
  config,
  onUpdateBooking,
  onUpdateConfig,
  onOpenStudentDashboard,
  onAddStudentToRoom
}: RoomVacancyManagerProps) {
  // State for all rooms
  const roomsList = useMemo<HostelRoom[]>(() => {
    const configured = config.roomsList && config.roomsList.length > 0 ? config.roomsList : DEFAULT_HOSTEL_ROOMS;
    
    // Also discover any extra room numbers mentioned in active student bookings that are not in default list
    const roomMap = new Map<string, HostelRoom>();
    configured.forEach(r => roomMap.set(r.roomNumber.trim().toUpperCase(), { ...r }));

    bookings.forEach(b => {
      if (b.roomNumber && b.roomNumber.trim()) {
        const key = b.roomNumber.trim().toUpperCase();
        if (!roomMap.has(key)) {
          // Auto-generate room entry if student has assigned room number
          roomMap.set(key, {
            id: key,
            roomNumber: b.roomNumber.trim(),
            floor: b.roomNumber.startsWith('1') ? 'Ground Floor (ग्राउंड फ्लोर)' : b.roomNumber.startsWith('2') ? '1st Floor (प्रथम तल)' : b.roomNumber.startsWith('3') ? '2nd Floor (द्वितीय तल)' : 'Main Floor',
            type: b.roomType || 'single',
            capacity: b.roomType === 'twin' ? 2 : 1,
            status: 'available',
            notes: 'Auto-added from student records'
          });
        }
      }
    });

    return Array.from(roomMap.values()).sort((a, b) => {
      const numA = parseInt(a.roomNumber.replace(/\D/g, ''), 10) || 0;
      const numB = parseInt(b.roomNumber.replace(/\D/g, ''), 10) || 0;
      return numA - numB;
    });
  }, [config.roomsList, bookings]);

  // View Mode: Cards Grid vs Quick-Edit Table
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Filters & Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [vacancyFilter, setVacancyFilter] = useState<'all' | 'vacant' | 'occupied' | 'partial' | 'maintenance'>('all');
  const [floorFilter, setFloorFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<'all' | 'single' | 'twin' | 'full'>('all');

  // Room Type Rates Adjustment Panel State
  const [isRateManagerOpen, setIsRateManagerOpen] = useState(false);
  const [editSingleRent, setEditSingleRent] = useState(config.singleRoomRent.toString());
  const [editTwinRent, setEditTwinRent] = useState(config.twinRoomRent.toString());
  const [editFullRent, setEditFullRent] = useState((config.fullRoomRent || 5500).toString());
  const [editSingleDeposit, setEditSingleDeposit] = useState((config.singleRoomDeposit ?? 3000).toString());
  const [editTwinDeposit, setEditTwinDeposit] = useState((config.twinRoomDeposit ?? 2000).toString());
  const [editFullDeposit, setEditFullDeposit] = useState((config.fullRoomDeposit ?? 4000).toString());
  const [isSingleFullState, setIsSingleFullState] = useState(config.isSingleFull || false);
  const [isTwinFullState, setIsTwinFullState] = useState(config.isTwinFull || false);
  const [isFullRoomFullState, setIsFullRoomFullState] = useState(config.isFullRoomFull || false);

  // Sync rate inputs when config changes
  useEffect(() => {
    setEditSingleRent(config.singleRoomRent.toString());
    setEditTwinRent(config.twinRoomRent.toString());
    setEditFullRent((config.fullRoomRent || 5500).toString());
    setEditSingleDeposit((config.singleRoomDeposit ?? 3000).toString());
    setEditTwinDeposit((config.twinRoomDeposit ?? 2000).toString());
    setEditFullDeposit((config.fullRoomDeposit ?? 4000).toString());
    setIsSingleFullState(config.isSingleFull || false);
    setIsTwinFullState(config.isTwinFull || false);
    setIsFullRoomFullState(config.isFullRoomFull || false);
  }, [config]);

  // Modals State
  const [editingRoom, setEditingRoom] = useState<HostelRoom | null>(null);
  const [isAddRoomOpen, setIsAddRoomOpen] = useState(false);
  const [assignModalRoom, setAssignModalRoom] = useState<HostelRoom | null>(null);
  const [shiftModalStudent, setShiftModalStudent] = useState<BookingInquiry | null>(null);
  const [targetShiftRoomNumber, setTargetShiftRoomNumber] = useState<string>('');
  const [toastMessage, setToastMessage] = useState<string>('');

  // Add Room Form State
  const [newRoomNum, setNewRoomNum] = useState('');
  const [newRoomFloor, setNewRoomFloor] = useState('Ground Floor (ग्राउंड फ्लोर)');
  const [newRoomType, setNewRoomType] = useState<'single' | 'twin' | 'full'>('single');
  const [newRoomStatus, setNewRoomStatus] = useState<'available' | 'maintenance' | 'occupied'>('available');
  const [newRoomRent, setNewRoomRent] = useState<string>('');
  const [newRoomNotes, setNewRoomNotes] = useState('');
  const [newRoomAmenities, setNewRoomAmenities] = useState<string[]>([]);

  // Toast helper
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  // Map students currently in each room
  const roomOccupancyMap = useMemo(() => {
    const map: Record<string, BookingInquiry[]> = {};
    bookings.forEach(b => {
      if (b.roomNumber && b.roomNumber.trim()) {
        const key = b.roomNumber.trim().toUpperCase();
        if (!map[key]) map[key] = [];
        map[key].push(b);
      }
    });
    return map;
  }, [bookings]);

  // Unassigned active approved students list (to easily assign to a room)
  const unassignedStudents = useMemo(() => {
    return bookings.filter(b => (!b.roomNumber || !b.roomNumber.trim()) && b.status !== 'rejected');
  }, [bookings]);

  // Unique floors list for dropdown filter
  const uniqueFloors = useMemo(() => {
    const set = new Set<string>();
    roomsList.forEach(r => {
      if (r.floor) set.add(r.floor);
    });
    return Array.from(set);
  }, [roomsList]);

  // Aggregate Metrics & Insights
  const metrics = useMemo(() => {
    let totalRooms = roomsList.length;
    let totalBeds = 0;
    let occupiedBeds = 0;
    let fullyVacantRooms = 0;
    let fullyOccupiedRooms = 0;
    let partiallyOccupiedRooms = 0;
    let maintenanceRooms = 0;

    let singleRoomsTotal = 0;
    let singleRoomsOccupied = 0;
    let twinRoomsTotal = 0;
    let twinBedsOccupied = 0;
    let fullRoomsTotal = 0;
    let fullRoomsOccupied = 0;

    roomsList.forEach(room => {
      const roomCapacity = room.capacity || (room.type === 'twin' ? 2 : 1);
      totalBeds += roomCapacity;

      if (room.status === 'maintenance') {
        maintenanceRooms++;
      }

      const occupants = roomOccupancyMap[room.roomNumber.trim().toUpperCase()] || [];
      const hasManualOccupied = room.status === 'occupied' && occupants.length === 0;
      const count = hasManualOccupied ? roomCapacity : occupants.length;
      occupiedBeds += count;

      if (room.type === 'single') {
        singleRoomsTotal++;
        if (count >= 1) singleRoomsOccupied++;
      } else if (room.type === 'full') {
        fullRoomsTotal++;
        if (count >= 1) fullRoomsOccupied++;
      } else {
        twinRoomsTotal++;
        twinBedsOccupied += count;
      }

      if (count === 0 && room.status !== 'maintenance') {
        fullyVacantRooms++;
      } else if (count >= roomCapacity) {
        fullyOccupiedRooms++;
      } else if (count > 0 && count < roomCapacity) {
        partiallyOccupiedRooms++;
      }
    });

    const vacantBeds = Math.max(0, totalBeds - occupiedBeds);
    const occupancyPercentage = totalBeds > 0 ? Math.round((occupiedBeds / totalBeds) * 100) : 0;

    return {
      totalRooms,
      totalBeds,
      occupiedBeds,
      vacantBeds,
      fullyVacantRooms,
      fullyOccupiedRooms,
      partiallyOccupiedRooms,
      maintenanceRooms,
      singleRoomsTotal,
      singleRoomsOccupied,
      singleRoomsVacant: Math.max(0, singleRoomsTotal - singleRoomsOccupied),
      twinRoomsTotal,
      twinTotalBeds: twinRoomsTotal * 2,
      twinBedsOccupied,
      twinBedsVacant: Math.max(0, (twinRoomsTotal * 2) - twinBedsOccupied),
      fullRoomsTotal,
      fullRoomsOccupied,
      fullRoomsVacant: Math.max(0, fullRoomsTotal - fullRoomsOccupied),
      occupancyPercentage
    };
  }, [roomsList, roomOccupancyMap]);

  // Filtered rooms list based on user selections
  const filteredRooms = useMemo(() => {
    return roomsList.filter(room => {
      const key = room.roomNumber.trim().toUpperCase();
      const occupants = roomOccupancyMap[key] || [];
      const count = room.status === 'occupied' && occupants.length === 0 ? (room.capacity || 1) : occupants.length;
      const capacity = room.capacity || (room.type === 'twin' ? 2 : 1);

      // Search match
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesRoom = room.roomNumber.toLowerCase().includes(q) || (room.floor && room.floor.toLowerCase().includes(q));
        const matchesStudent = occupants.some(s => 
          s.fullName.toLowerCase().includes(q) || 
          s.phone.toLowerCase().includes(q) ||
          (s.studyYear && s.studyYear.toLowerCase().includes(q))
        );
        const matchesNotes = room.notes && room.notes.toLowerCase().includes(q);
        if (!matchesRoom && !matchesStudent && !matchesNotes) return false;
      }

      // Floor match
      if (floorFilter !== 'all' && room.floor !== floorFilter) {
        return false;
      }

      // Room Type match
      if (typeFilter !== 'all' && room.type !== typeFilter) {
        return false;
      }

      // Vacancy Filter match
      if (vacancyFilter === 'vacant') {
        return count === 0 && room.status !== 'maintenance';
      }
      if (vacancyFilter === 'occupied') {
        return count >= capacity && room.status !== 'maintenance';
      }
      if (vacancyFilter === 'partial') {
        return count > 0 && count < capacity && room.status !== 'maintenance';
      }
      if (vacancyFilter === 'maintenance') {
        return room.status === 'maintenance';
      }

      return true;
    });
  }, [roomsList, roomOccupancyMap, searchQuery, vacancyFilter, floorFilter, typeFilter]);

  // Handle Save Room Type Rates
  const handleSaveRoomTypeRates = (e: React.FormEvent) => {
    e.preventDefault();
    const singleRent = parseInt(editSingleRent, 10) || 4500;
    const twinRent = parseInt(editTwinRent, 10) || 3000;
    const fullRent = parseInt(editFullRent, 10) || 5500;
    const singleDep = parseInt(editSingleDeposit, 10) || 3000;
    const twinDep = parseInt(editTwinDeposit, 10) || 2000;
    const fullDep = parseInt(editFullDeposit, 10) || 4000;

    onUpdateConfig({
      ...config,
      singleRoomRent: singleRent,
      twinRoomRent: twinRent,
      fullRoomRent: fullRent,
      singleRoomDeposit: singleDep,
      twinRoomDeposit: twinDep,
      fullRoomDeposit: fullDep,
      isSingleFull: isSingleFullState,
      isTwinFull: isTwinFullState,
      isFullRoomFull: isFullRoomFullState
    });

    setIsRateManagerOpen(false);
    showToast('✓ कमरों की मानक किराया दरें और बुकिंग स्थिति सफलतापूर्वक अपडेट हो गई!');
  };

  // Quick 1-Click Status Changer on Room Card / Table
  const handleQuickSetRoomStatus = (room: HostelRoom, newStatus: 'available' | 'occupied' | 'maintenance' | 'reserved') => {
    const key = room.roomNumber.trim().toUpperCase();
    const occupants = roomOccupancyMap[key] || [];

    // If changing from Occupied to Empty (Available) and there are occupants
    if (newStatus === 'available' && occupants.length > 0) {
      const confirmVacate = confirm(`कमरा ${room.roomNumber} में वर्तमान में ${occupants.map(o => o.fullName).join(', ')} रह रहे हैं।\n\nक्या आप इन छात्रों को इस कमरे से खाली (Unassign) करके कमरे को "खाली/Available" करना चाहते हैं?`);
      if (confirmVacate) {
        // Unassign all occupants from this room
        occupants.forEach(student => {
          onUpdateBooking({
            ...student,
            roomNumber: ''
          });
        });
      } else {
        return;
      }
    }

    const updatedRooms = roomsList.map(r => {
      if (r.id === room.id || r.roomNumber.toUpperCase() === room.roomNumber.toUpperCase()) {
        return {
          ...r,
          status: newStatus
        };
      }
      return r;
    });

    onUpdateConfig({
      ...config,
      roomsList: updatedRooms
    });

    const statusLabel = 
      newStatus === 'available' ? 'खाली (Empty / Available)' : 
      newStatus === 'occupied' ? 'भरा हुआ (Occupied / Full)' : 
      newStatus === 'maintenance' ? 'मरम्मत (Maintenance)' : 'आरक्षित (Reserved)';

    showToast(`✓ कमरा ${room.roomNumber} का स्टेटस बदल कर "${statusLabel}" कर दिया गया!`);
  };

  // Handle Save New Room
  const handleAddRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoomNum.trim()) return;

    const cleanNum = newRoomNum.trim().toUpperCase();
    if (roomsList.some(r => r.roomNumber.toUpperCase() === cleanNum)) {
      alert(`कमरा नंबर ${cleanNum} पहले से मौजूद है!`);
      return;
    }

    const newRoom: HostelRoom = {
      id: cleanNum,
      roomNumber: newRoomNum.trim(),
      floor: newRoomFloor,
      type: newRoomType,
      capacity: newRoomType === 'twin' ? 2 : 1,
      status: newRoomStatus,
      customRent: newRoomRent ? parseInt(newRoomRent, 10) : undefined,
      notes: newRoomNotes.trim(),
      amenities: newRoomAmenities
    };

    const updatedRooms = [...roomsList, newRoom];
    onUpdateConfig({
      ...config,
      roomsList: updatedRooms
    });

    setIsAddRoomOpen(false);
    setNewRoomNum('');
    setNewRoomNotes('');
    setNewRoomRent('');
    setNewRoomAmenities([]);
    showToast(`✓ नया कमरा ${newRoom.roomNumber} सफलतापूर्वक जोड़ दिया गया!`);
  };

  // Handle Edit Room Save
  const handleSaveEditRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRoom) return;

    const updatedRooms = roomsList.map(r => r.id === editingRoom.id ? editingRoom : r);
    onUpdateConfig({
      ...config,
      roomsList: updatedRooms
    });

    setEditingRoom(null);
    showToast(`✓ कमरा ${editingRoom.roomNumber} का संपूर्ण विवरण और किराया अपडेट कर दिया गया!`);
  };

  // Handle Quick Empty Room (from inside Edit Modal)
  const handleModalEmptyRoom = () => {
    if (!editingRoom) return;
    const key = editingRoom.roomNumber.trim().toUpperCase();
    const occupants = roomOccupancyMap[key] || [];

    if (occupants.length > 0) {
      const confirmVacate = confirm(`कमरा ${editingRoom.roomNumber} में ${occupants.map(o => o.fullName).join(', ')} असाइन हैं। क्या आप इन्हें अन-असाइन करके कमरा खाली करना चाहते हैं?`);
      if (confirmVacate) {
        occupants.forEach(student => {
          onUpdateBooking({
            ...student,
            roomNumber: ''
          });
        });
      }
    }

    setEditingRoom({
      ...editingRoom,
      status: 'available'
    });
    showToast(`✓ कमरा ${editingRoom.roomNumber} का स्टेटस 'खाली (Available)' सेट कर दिया गया!`);
  };

  // Handle Delete Room
  const handleDeleteRoom = (roomId: string, roomNum: string) => {
    const occupants = roomOccupancyMap[roomNum.toUpperCase()] || [];
    if (occupants.length > 0) {
      alert(`कमरा ${roomNum} अभी खाली नहीं है! इसमें ${occupants.map(o => o.fullName).join(', ')} रह रहे हैं। पहले उन्हें शिफ्ट या अन-असाइन करें।`);
      return;
    }

    if (!confirm(`क्या आप सच में कमरा नंबर ${roomNum} को लिस्ट से हटाना चाहते हैं?`)) {
      return;
    }

    const updatedRooms = roomsList.filter(r => r.id !== roomId && r.roomNumber.toUpperCase() !== roomNum.toUpperCase());
    onUpdateConfig({
      ...config,
      roomsList: updatedRooms
    });
    showToast(`कमरा ${roomNum} हटा दिया गया।`);
  };

  // Handle Assign Student to Room
  const handleAssignStudent = (studentId: string, room: HostelRoom) => {
    const student = bookings.find(b => b.id === studentId);
    if (!student) return;

    const updated: BookingInquiry = {
      ...student,
      roomNumber: room.roomNumber,
      roomType: room.type,
      monthlyRentAmount: room.customRent || (room.type === 'single' ? config.singleRoomRent : room.type === 'full' ? (config.fullRoomRent || 5500) : config.twinRoomRent),
      status: 'approved',
      ownerPermission: true
    };

    onUpdateBooking(updated);
    setAssignModalRoom(null);
    showToast(`✓ ${student.fullName} को कमra ${room.roomNumber} अलॉट कर दिया गया!`);
  };

  // Handle Vacate Student from Room
  const handleVacateStudent = (student: BookingInquiry) => {
    if (!confirm(`क्या आप ${student.fullName} को कमरा ${student.roomNumber} से खाली (Unassign) करना चाहते हैं?`)) {
      return;
    }

    const updated: BookingInquiry = {
      ...student,
      roomNumber: ''
    };

    onUpdateBooking(updated);
    showToast(`✓ ${student.fullName} को कमरे से हटा दिया गया (कमरा खाली हो गया)।`);
  };

  // Handle Shift Student to another Room
  const handleShiftStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!shiftModalStudent || !targetShiftRoomNumber) return;

    const targetRoom = roomsList.find(r => r.roomNumber.toUpperCase() === targetShiftRoomNumber.toUpperCase());
    const occupants = roomOccupancyMap[targetShiftRoomNumber.toUpperCase()] || [];
    const capacity = targetRoom ? targetRoom.capacity : 1;

    if (occupants.length >= capacity) {
      alert(`कमरा ${targetShiftRoomNumber} पहले से पूरा भरा है! कृपया कोई खाली कमरा चुनें।`);
      return;
    }

    const updated: BookingInquiry = {
      ...shiftModalStudent,
      roomNumber: targetShiftRoomNumber,
      roomType: targetRoom ? targetRoom.type : shiftModalStudent.roomType,
      monthlyRentAmount: targetRoom?.customRent || (targetRoom?.type === 'single' ? config.singleRoomRent : targetRoom?.type === 'full' ? (config.fullRoomRent || 5500) : config.twinRoomRent)
    };

    onUpdateBooking(updated);
    setShiftModalStudent(null);
    setTargetShiftRoomNumber('');
    showToast(`✓ ${shiftModalStudent.fullName} को सफलतापूर्वक कमरा ${targetShiftRoomNumber} में शिफ्ट कर दिया गया!`);
  };

  return (
    <div className="space-y-6" id="room-vacancy-manager-root">
      
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3.5 rounded-2xl shadow-2xl border border-slate-700 flex items-center gap-3 animate-fade-in text-xs font-bold">
          <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ================= TOP HEADER & QUICK ACTION BAR ================= */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-3xs flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center font-bold">
              <Building className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-display font-black text-lg text-slate-900 flex items-center gap-2">
                <span>कमरा व किराया प्रबंधन (Room & Rent Caretaker Console)</span>
                <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black px-2 py-0.5 rounded-md">
                  Live Sync
                </span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                कमरों का स्टेटस (खाली / भरा हुआ / मरम्मत), विशेष किराया और प्रकार संशोधित करें।
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5 w-full lg:w-auto flex-wrap">
          {/* Toggle Room Type Rates Panel */}
          <button
            type="button"
            onClick={() => setIsRateManagerOpen(!isRateManagerOpen)}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 cursor-pointer ${
              isRateManagerOpen 
                ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs' 
                : 'bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100'
            }`}
          >
            <DollarSign className="w-3.5 h-3.5" />
            <span>कमरा प्रकार किराया दरें (Rates)</span>
            {isRateManagerOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          {/* View Mode Toggle (Grid vs Table) */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-bold">
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`px-2.5 py-1.5 rounded-lg transition-all flex items-center gap-1 cursor-pointer ${
                viewMode === 'grid' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
              }`}
              title="कार्ड ग्रिड दृश्य"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">कार्ड्स</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`px-2.5 py-1.5 rounded-lg transition-all flex items-center gap-1 cursor-pointer ${
                viewMode === 'table' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
              }`}
              title="त्वरित संपादन तालिका"
            >
              <TableIcon className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">त्वरित टेबल</span>
            </button>
          </div>

          {/* Add New Room Button */}
          <button
            type="button"
            onClick={() => setIsAddRoomOpen(true)}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer ml-auto lg:ml-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>नया कमरा जोड़ें</span>
          </button>
        </div>
      </div>

      {/* ================= ROOM TYPE RATES QUICK ADJUSTMENT PANEL ================= */}
      {isRateManagerOpen && (
        <div className="bg-gradient-to-br from-indigo-900 via-slate-900 to-slate-950 text-white p-5 sm:p-6 rounded-3xl shadow-xl border border-indigo-500/30 animate-scale-up space-y-5">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-indigo-800/60 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <Sliders className="w-5 h-5 text-indigo-400" />
                <h3 className="font-display font-black text-base text-white">
                  कमरा प्रकार अनुसार किराया व बुकिंग स्थिति (Room Type Base Rates & Status)
                </h3>
              </div>
              <p className="text-xs text-indigo-200/80 mt-1">
                यहाँ से Single, Twin और Full Room का मानक मासिक किराया, सिक्योरिटी डिपॉजिट और बुकिंग स्टेटस (Full / Open) तुरंत बदलें।
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsRateManagerOpen(false)}
              className="text-indigo-300 hover:text-white p-1 rounded-lg hover:bg-indigo-800/40"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSaveRoomTypeRates} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              
              {/* Option 1: Single Room (1-Seater) */}
              <div className="bg-white/10 backdrop-blur-xs p-4 rounded-2xl border border-white/15 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-7 h-7 rounded-lg bg-indigo-500 text-white font-black text-xs flex items-center justify-center">1</span>
                    <span className="font-bold text-sm text-white">Single (1-Seater)</span>
                  </div>
                  <label className="flex items-center gap-1.5 cursor-pointer text-[11px] font-bold">
                    <input
                      type="checkbox"
                      checked={isSingleFullState}
                      onChange={(e) => setIsSingleFullState(e.target.checked)}
                      className="rounded text-rose-500 focus:ring-rose-500 cursor-pointer"
                    />
                    <span className={isSingleFullState ? 'text-rose-300 font-extrabold' : 'text-slate-300'}>
                      {isSingleFullState ? '🔴 रूम फुल' : '🟢 बुकिंग ओपन'}
                    </span>
                  </label>
                </div>

                <div className="space-y-2">
                  <div>
                    <label className="block text-[11px] font-bold text-indigo-200">मासिक किराया (₹ / महीना)</label>
                    <input
                      type="number"
                      value={editSingleRent}
                      onChange={(e) => setEditSingleRent(e.target.value)}
                      className="w-full mt-1 px-3 py-1.5 bg-slate-900/90 rounded-xl border border-indigo-400/40 text-sm font-black text-white focus:outline-none focus:ring-2 focus:ring-indigo-400"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-indigo-200">सिक्योरिटी डिपॉजिट (₹ Refundable)</label>
                    <input
                      type="number"
                      value={editSingleDeposit}
                      onChange={(e) => setEditSingleDeposit(e.target.value)}
                      className="w-full mt-1 px-3 py-1.5 bg-slate-900/90 rounded-xl border border-indigo-400/40 text-xs font-bold text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                    />
                  </div>
                </div>
              </div>

              {/* Option 2: Twin Sharing (2-Seater) */}
              <div className="bg-white/10 backdrop-blur-xs p-4 rounded-2xl border border-white/15 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-7 h-7 rounded-lg bg-purple-500 text-white font-black text-xs flex items-center justify-center">2</span>
                    <span className="font-bold text-sm text-white">Twin (2-Seater)</span>
                  </div>
                  <label className="flex items-center gap-1.5 cursor-pointer text-[11px] font-bold">
                    <input
                      type="checkbox"
                      checked={isTwinFullState}
                      onChange={(e) => setIsTwinFullState(e.target.checked)}
                      className="rounded text-rose-500 focus:ring-rose-500 cursor-pointer"
                    />
                    <span className={isTwinFullState ? 'text-rose-300 font-extrabold' : 'text-slate-300'}>
                      {isTwinFullState ? '🔴 रूम फुल' : '🟢 बुकिंग ओपन'}
                    </span>
                  </label>
                </div>

                <div className="space-y-2">
                  <div>
                    <label className="block text-[11px] font-bold text-indigo-200">प्रति बेड मासिक किराया (₹ / महीना)</label>
                    <input
                      type="number"
                      value={editTwinRent}
                      onChange={(e) => setEditTwinRent(e.target.value)}
                      className="w-full mt-1 px-3 py-1.5 bg-slate-900/90 rounded-xl border border-indigo-400/40 text-sm font-black text-white focus:outline-none focus:ring-2 focus:ring-indigo-400"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-indigo-200">सिक्योरिटी डिपॉजिट (₹ Refundable)</label>
                    <input
                      type="number"
                      value={editTwinDeposit}
                      onChange={(e) => setEditTwinDeposit(e.target.value)}
                      className="w-full mt-1 px-3 py-1.5 bg-slate-900/90 rounded-xl border border-indigo-400/40 text-xs font-bold text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                    />
                  </div>
                </div>
              </div>

              {/* Option 3: Full Private Room (निजी पूरा कमरा) */}
              <div className="bg-white/10 backdrop-blur-xs p-4 rounded-2xl border border-white/15 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-7 h-7 rounded-lg bg-teal-500 text-white font-black text-xs flex items-center justify-center">F</span>
                    <span className="font-bold text-sm text-white">Full Private Room</span>
                  </div>
                  <label className="flex items-center gap-1.5 cursor-pointer text-[11px] font-bold">
                    <input
                      type="checkbox"
                      checked={isFullRoomFullState}
                      onChange={(e) => setIsFullRoomFullState(e.target.checked)}
                      className="rounded text-rose-500 focus:ring-rose-500 cursor-pointer"
                    />
                    <span className={isFullRoomFullState ? 'text-rose-300 font-extrabold' : 'text-slate-300'}>
                      {isFullRoomFullState ? '🔴 रूम फुल' : '🟢 बुकिंग ओपन'}
                    </span>
                  </label>
                </div>

                <div className="space-y-2">
                  <div>
                    <label className="block text-[11px] font-bold text-indigo-200">पूरे कमरे का किराया (₹ / महीना)</label>
                    <input
                      type="number"
                      value={editFullRent}
                      onChange={(e) => setEditFullRent(e.target.value)}
                      className="w-full mt-1 px-3 py-1.5 bg-slate-900/90 rounded-xl border border-indigo-400/40 text-sm font-black text-white focus:outline-none focus:ring-2 focus:ring-indigo-400"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-indigo-200">सिक्योरिटी डिपॉजिट (₹ Refundable)</label>
                    <input
                      type="number"
                      value={editFullDeposit}
                      onChange={(e) => setEditFullDeposit(e.target.value)}
                      className="w-full mt-1 px-3 py-1.5 bg-slate-900/90 rounded-xl border border-indigo-400/40 text-xs font-bold text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                    />
                  </div>
                </div>
              </div>

            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsRateManagerOpen(false)}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 text-xs font-bold text-white rounded-xl transition-all"
              >
                रद्द करें
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black text-xs rounded-xl transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>किराया दरें सहेजें (Save Rates)</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ================= TOP METRICS & INSIGHTS CARDS ================= */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        
        {/* Card 1: Total Rooms */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-3xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-bold uppercase tracking-wider">कुल कमरे</span>
            <Building className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="mt-2">
            <span className="font-display font-black text-2xl text-slate-900">{metrics.totalRooms}</span>
            <span className="text-[10px] text-slate-400 block mt-0.5">कमरे हॉस्टल में</span>
          </div>
        </div>

        {/* Card 2: Vacant Beds (Super Highlight) */}
        <div className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white p-4 rounded-2xl shadow-md shadow-emerald-500/10 flex flex-col justify-between">
          <div className="flex items-center justify-between text-emerald-100">
            <span className="text-[11px] font-extrabold uppercase tracking-wider">खाली बिस्तर (Vacant)</span>
            <Bed className="w-4 h-4 text-white" />
          </div>
          <div className="mt-2">
            <span className="font-display font-black text-3xl text-white">{metrics.vacantBeds}</span>
            <span className="text-[10px] text-emerald-100 block mt-0.5 font-bold">
              {metrics.fullyVacantRooms} कमरे 100% खाली
            </span>
          </div>
        </div>

        {/* Card 3: Occupied Beds */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-3xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-bold uppercase tracking-wider">भरे बिस्तर (Occupied)</span>
            <UserCheck className="w-4 h-4 text-primary-600" />
          </div>
          <div className="mt-2">
            <div className="flex items-baseline gap-1.5">
              <span className="font-display font-black text-2xl text-slate-900">{metrics.occupiedBeds}</span>
              <span className="text-xs text-slate-400 font-bold">/ {metrics.totalBeds}</span>
            </div>
            <span className="text-[10px] text-primary-700 block mt-0.5 font-bold">
              {metrics.occupancyPercentage}% भरा हुआ
            </span>
          </div>
        </div>

        {/* Card 4: Single Room Status */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-3xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-bold uppercase tracking-wider">1-Seater (सिंगल)</span>
            <Users className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="mt-2">
            <div className="flex items-baseline gap-1.5">
              <span className="font-display font-black text-xl text-emerald-700">{metrics.singleRoomsVacant} खाली</span>
            </div>
            <span className="text-[10px] text-slate-400 block mt-0.5">
              कुल {metrics.singleRoomsTotal} कमरे ({metrics.singleRoomsOccupied} भरे)
            </span>
          </div>
        </div>

        {/* Card 5: Twin Sharing Status */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-3xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-bold uppercase tracking-wider">2-Seater (ट्विन)</span>
            <Users className="w-4 h-4 text-purple-600" />
          </div>
          <div className="mt-2">
            <div className="flex items-baseline gap-1.5">
              <span className="font-display font-black text-xl text-emerald-700">{metrics.twinBedsVacant} सीट खाली</span>
            </div>
            <span className="text-[10px] text-slate-400 block mt-0.5">
              कुल {metrics.twinRoomsTotal} कमरे ({metrics.twinBedsOccupied} सीट भरी)
            </span>
          </div>
        </div>

        {/* Card 6: Maintenance Rooms / Quick Adjust Rates */}
        <div className="bg-slate-900 text-white p-4 rounded-2xl shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-300">
            <span className="text-[11px] font-bold uppercase tracking-wider">किराया सेटअप</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <button
            type="button"
            onClick={() => setIsRateManagerOpen(true)}
            className="w-full mt-2 py-2 bg-gradient-to-r from-primary-600 to-indigo-600 hover:from-primary-700 hover:to-indigo-700 text-white font-extrabold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>किराया दरें बदलें</span>
          </button>
        </div>

      </div>

      {/* ================= UNASSIGNED STUDENTS ALERT BANNER ================= */}
      {unassignedStudents.length > 0 && (
        <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/80 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-3xs">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-xs">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-xs sm:text-sm text-amber-950 dark:text-amber-200 flex items-center gap-2">
                <span>{unassignedStudents.length} छात्र(ों) को अभी तक कोई कमरा अलॉट नहीं हुआ है!</span>
                <span className="bg-amber-200 dark:bg-amber-800 text-amber-900 dark:text-amber-100 text-[10px] font-black px-2 py-0.5 rounded-full">
                  Unassigned
                </span>
              </h4>
              <p className="text-[11px] text-amber-800 dark:text-amber-300 mt-0.5">
                नीचे किसी भी खाली (Vacant) कमरे के "छात्र अलॉट करें" बटन पर क्लिक करके इन्हें तुरंत कमरा दें।
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
            {unassignedStudents.slice(0, 4).map(s => (
              <span key={s.id} className="text-[11px] font-bold bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 px-2.5 py-1 rounded-lg border border-amber-200 dark:border-amber-700 whitespace-nowrap shadow-3xs">
                {s.fullName} ({s.roomType === 'single' ? '1-Seater' : s.roomType === 'full' ? 'Full Room' : '2-Seater'})
              </span>
            ))}
            {unassignedStudents.length > 4 && (
              <span className="text-[10px] font-bold text-amber-700">+{unassignedStudents.length - 4} more</span>
            )}
          </div>
        </div>
      )}

      {/* ================= CONTROLS & FILTERS BAR ================= */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-3xs space-y-3">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          
          {/* Search bar */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="कमरा नंबर (101, 202) या छात्र का नाम..."
              className="w-full pl-9 pr-4 py-2 bg-slate-50 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Quick Filters */}
          <div className="flex items-center gap-2 flex-wrap w-full md:w-auto">
            
            {/* Vacancy Filter Tabs */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-bold">
              <button
                type="button"
                onClick={() => setVacancyFilter('all')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  vacancyFilter === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                सभी ({roomsList.length})
              </button>
              <button
                type="button"
                onClick={() => setVacancyFilter('vacant')}
                className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1 cursor-pointer ${
                  vacancyFilter === 'vacant' ? 'bg-emerald-600 text-white shadow-xs' : 'text-emerald-700 hover:bg-emerald-50'
                }`}
              >
                <CheckCircle className="w-3.5 h-3.5" />
                <span>खाली</span>
              </button>
              <button
                type="button"
                onClick={() => setVacancyFilter('occupied')}
                className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1 cursor-pointer ${
                  vacancyFilter === 'occupied' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-200'
                }`}
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span>भरा हुआ</span>
              </button>
              <button
                type="button"
                onClick={() => setVacancyFilter('maintenance')}
                className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1 cursor-pointer ${
                  vacancyFilter === 'maintenance' ? 'bg-amber-600 text-white shadow-xs' : 'text-amber-700 hover:bg-amber-50'
                }`}
              >
                <Wrench className="w-3.5 h-3.5" />
                <span>मरम्मत</span>
              </button>
            </div>

            {/* Room Type Filter */}
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as any)}
              className="px-3 py-2 bg-slate-50 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 focus:outline-none cursor-pointer"
            >
              <option value="all">सभी प्रकार (1, 2 & Full Room)</option>
              <option value="single">Single (1-Seater)</option>
              <option value="twin">Twin (2-Seater)</option>
              <option value="full">Full Private Room (निजी)</option>
            </select>

            {/* Floor Filter */}
            {uniqueFloors.length > 1 && (
              <select
                value={floorFilter}
                onChange={(e) => setFloorFilter(e.target.value)}
                className="px-3 py-2 bg-slate-50 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 focus:outline-none cursor-pointer"
              >
                <option value="all">सभी तल (All Floors)</option>
                {uniqueFloors.map(f => (
                  <option key={f} value={f}>{f}</option>
                ))}
              </select>
            )}

          </div>
        </div>
      </div>

      {/* ================= VIEW MODE 1: GRID CARDS MATRIX ================= */}
      {viewMode === 'grid' && (
        filteredRooms.length === 0 ? (
          <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
              <Home className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-sm text-slate-800">कोई कमरा नहीं मिला</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              आपके चुने हुए फ़िल्टर या खोज के अनुसार कोई कमरा उपलब्ध नहीं है। फ़िल्टर रीसेट करें।
            </p>
            <button
              type="button"
              onClick={() => { setSearchQuery(''); setVacancyFilter('all'); setFloorFilter('all'); setTypeFilter('all'); }}
              className="text-xs font-bold text-primary-600 hover:text-primary-700 underline"
            >
              सभी फ़िल्टर साफ़ करें
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredRooms.map((room) => {
              const key = room.roomNumber.trim().toUpperCase();
              const occupants = roomOccupancyMap[key] || [];
              const capacity = room.capacity || (room.type === 'twin' ? 2 : 1);
              const isManualOccupied = room.status === 'occupied' && occupants.length === 0;
              const count = isManualOccupied ? capacity : occupants.length;
              const isFull = count >= capacity;
              const isPartiallyFull = count > 0 && count < capacity;
              const isCompletelyVacant = count === 0 && room.status !== 'maintenance';
              const isMaintenance = room.status === 'maintenance';
              const isReserved = room.status === 'reserved';

              const roomRent = room.customRent || (room.type === 'single' ? config.singleRoomRent : room.type === 'full' ? (config.fullRoomRent || 5500) : config.twinRoomRent);

              return (
                <div 
                  key={room.id}
                  className={`bg-white rounded-2xl border transition-all duration-200 overflow-hidden shadow-3xs hover:shadow-md flex flex-col justify-between ${
                    isCompletelyVacant 
                      ? 'border-emerald-300 ring-1 ring-emerald-400/20' 
                      : isPartiallyFull 
                      ? 'border-amber-300 ring-1 ring-amber-400/20' 
                      : isMaintenance
                      ? 'border-slate-300 bg-slate-50/50'
                      : isReserved
                      ? 'border-blue-300 ring-1 ring-blue-400/20'
                      : 'border-slate-200'
                  }`}
                >
                  
                  {/* Room Header */}
                  <div className={`p-4 border-b flex items-start justify-between gap-3 ${
                    isCompletelyVacant 
                      ? 'bg-gradient-to-r from-emerald-50 to-teal-50/40 border-emerald-100' 
                      : isPartiallyFull 
                      ? 'bg-gradient-to-r from-amber-50 to-orange-50/40 border-amber-100' 
                      : isMaintenance
                      ? 'bg-slate-100 border-slate-200'
                      : isReserved
                      ? 'bg-blue-50 border-blue-100'
                      : 'bg-slate-50/80 border-slate-100'
                  }`}>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-display font-black text-xl text-slate-900">
                          Room {room.roomNumber}
                        </span>
                        <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md border ${
                          room.type === 'single' 
                            ? 'bg-indigo-50 text-indigo-700 border-indigo-200' 
                            : room.type === 'full'
                            ? 'bg-teal-50 text-teal-700 border-teal-200'
                            : 'bg-purple-50 text-purple-700 border-purple-200'
                        }`}>
                          {room.type === 'single' ? '1-Seater Single' : room.type === 'full' ? 'Full Room (निजी)' : '2-Seater Twin'}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-500 font-medium block mt-0.5">
                        {room.floor || 'Ground Floor'}
                      </span>
                    </div>

                    {/* Vacancy Status Badge & Quick Status Selector */}
                    <div className="flex flex-col items-end gap-1">
                      {isCompletelyVacant && (
                        <span className="bg-emerald-600 text-white text-[11px] font-extrabold px-2.5 py-1 rounded-lg flex items-center gap-1 shadow-3xs">
                          <CheckCircle className="w-3 h-3" />
                          <span>खाली है (Empty)</span>
                        </span>
                      )}
                      {isPartiallyFull && (
                        <span className="bg-amber-500 text-white text-[11px] font-extrabold px-2.5 py-1 rounded-lg flex items-center gap-1 shadow-3xs">
                          <Bed className="w-3 h-3" />
                          <span>1 बेड खाली!</span>
                        </span>
                      )}
                      {isFull && !isMaintenance && (
                        <span className="bg-slate-800 text-slate-200 text-[11px] font-bold px-2.5 py-1 rounded-lg flex items-center gap-1">
                          <UserCheck className="w-3 h-3 text-emerald-400" />
                          <span>फुल (Occupied)</span>
                        </span>
                      )}
                      {isMaintenance && (
                        <span className="bg-slate-600 text-white text-[11px] font-bold px-2.5 py-1 rounded-lg flex items-center gap-1">
                          <Wrench className="w-3 h-3" />
                          <span>मरम्मत (Blocked)</span>
                        </span>
                      )}
                      {isReserved && (
                        <span className="bg-blue-600 text-white text-[11px] font-bold px-2.5 py-1 rounded-lg flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>आरक्षित (Reserved)</span>
                        </span>
                      )}

                      {/* Quick Status Dropdown for Caretaker */}
                      <select
                        value={room.status || (isFull ? 'occupied' : 'available')}
                        onChange={(e) => handleQuickSetRoomStatus(room, e.target.value as any)}
                        className="text-[10px] font-bold px-1.5 py-0.5 rounded border border-slate-300 bg-white text-slate-700 cursor-pointer shadow-3xs focus:outline-none"
                        title="त्वरित स्टेटस बदलें"
                      >
                        <option value="available">🟢 खाली (Empty)</option>
                        <option value="occupied">🔴 भरा हुआ (Occupied)</option>
                        <option value="reserved">🟡 आरक्षित (Reserved)</option>
                        <option value="maintenance">🛠️ मरम्मत (Blocked)</option>
                      </select>
                    </div>
                  </div>

                  {/* Room Body: Occupants, Rent and Bed Slots */}
                  <div className="p-4 space-y-3 flex-1">
                    
                    {/* Rent & Notes Info */}
                    <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-100">
                      <div className="flex items-center gap-1.5">
                        <span className="text-slate-500 font-medium">मासिक किराया:</span>
                        {room.customRent && (
                          <span className="text-[9px] bg-amber-100 text-amber-800 px-1.5 py-0.2 rounded font-black">
                            Custom Rate
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-slate-900">₹{roomRent}/महीना</span>
                        <button
                          type="button"
                          onClick={() => setEditingRoom(room)}
                          className="text-[10px] font-bold text-primary-600 hover:text-primary-800 hover:underline"
                        >
                          बदलें
                        </button>
                      </div>
                    </div>

                    {/* Amenities tags */}
                    {room.amenities && room.amenities.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {room.amenities.map(a => (
                          <span key={a} className="text-[9px] font-semibold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md">
                            ✓ {a}
                          </span>
                        ))}
                      </div>
                    )}

                    {room.notes && (
                      <p className="text-[11px] text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-100 italic">
                        📌 {room.notes}
                      </p>
                    )}

                    {/* Bed Slots Visualization */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                        <span>बिस्तर विवरण (Beds {count}/{capacity}):</span>
                        <span>{isCompletelyVacant ? 'सभी बेड खाली' : isFull ? 'सभी बेड भरे' : `${capacity - count} बेड उपलब्ध`}</span>
                      </div>

                      {/* Occupants list */}
                      {occupants.length > 0 ? (
                        <div className="space-y-2">
                          {occupants.map((student) => (
                            <div 
                              key={student.id} 
                              className="bg-slate-50 hover:bg-indigo-50/50 p-2.5 rounded-xl border border-slate-200 transition-all flex items-center justify-between gap-2"
                            >
                              <div className="flex items-center gap-2 min-w-0">
                                <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white text-xs font-black flex items-center justify-center shrink-0">
                                  {student.fullName.charAt(0)}
                                </div>
                                <div className="min-w-0">
                                  <div className="flex items-center gap-1.5 flex-wrap">
                                    <span className="font-bold text-xs text-slate-900 truncate">
                                      {student.fullName}
                                    </span>
                                    <span className={`text-[9px] font-extrabold px-1.5 py-0.2 rounded-full ${
                                      student.rentStatus === 'paid' 
                                        ? 'bg-emerald-100 text-emerald-800' 
                                        : 'bg-rose-100 text-rose-800'
                                    }`}>
                                      {student.rentStatus === 'paid' ? 'Rent Paid' : 'Rent Due'}
                                    </span>
                                  </div>
                                  <span className="text-[10px] text-slate-500 block truncate">
                                    {student.phone} • {student.studyYear}
                                  </span>
                                </div>
                              </div>

                              {/* Student Action Buttons */}
                              <div className="flex items-center gap-1 shrink-0">
                                {/* WhatsApp Contact */}
                                <a
                                  href={`https://wa.me/${student.phone.replace(/\D/g, '')}?text=Hello%20${encodeURIComponent(student.fullName)},%20this%20is%20regarding%20Room%20${room.roomNumber}%20at%20${encodeURIComponent(config.hostelName)}.`}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                                  title="WhatsApp Chat"
                                >
                                  <MessageSquare className="w-3.5 h-3.5" />
                                </a>

                                {/* Shift to another room */}
                                <button
                                  type="button"
                                  onClick={() => {
                                    setShiftModalStudent(student);
                                    setTargetShiftRoomNumber('');
                                  }}
                                  className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                                  title="कमरा बदलें (Shift Room)"
                                >
                                  <ArrowRightLeft className="w-3.5 h-3.5" />
                                </button>

                                {/* Vacate / Unassign */}
                                <button
                                  type="button"
                                  onClick={() => handleVacateStudent(student)}
                                  className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                                  title="कमरा खाली करें (Vacate / Unassign)"
                                >
                                  <UserX className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : isManualOccupied ? (
                        <div className="bg-slate-100 border border-slate-200 p-3 rounded-xl text-center space-y-1">
                          <p className="text-xs font-bold text-slate-800 flex items-center justify-center gap-1.5">
                            <Lock className="w-3.5 h-3.5 text-slate-600" />
                            <span>मैन्युअल रूप से भरा हुआ मार्क किया गया</span>
                          </p>
                          <button
                            type="button"
                            onClick={() => handleQuickSetRoomStatus(room, 'available')}
                            className="text-[11px] font-bold text-emerald-600 hover:text-emerald-800 underline cursor-pointer"
                          >
                            कमरा खाली (Empty) करें
                          </button>
                        </div>
                      ) : (
                        <div className="bg-emerald-50/60 border border-dashed border-emerald-200 p-3 rounded-xl text-center space-y-1">
                          <p className="text-xs font-bold text-emerald-800">
                            यह कमरा 100% खाली है
                          </p>
                          <p className="text-[10px] text-emerald-600">
                            नए छात्र को तुरंत अलॉट करें या बुकिंग के लिए खुला रखें
                          </p>
                        </div>
                      )}

                      {/* Twin room remaining free bed slot indicator */}
                      {isPartiallyFull && (
                        <div className="bg-amber-50/60 border border-dashed border-amber-200 p-2.5 rounded-xl text-center flex items-center justify-between">
                          <span className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                            <Bed className="w-3.5 h-3.5 text-amber-600" />
                            <span>बेड #2: खाली (Available)</span>
                          </span>
                          <span className="text-[10px] font-extrabold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-md">
                            1 सीट बची है
                          </span>
                        </div>
                      )}

                    </div>

                  </div>

                  {/* Room Footer Action Buttons */}
                  <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-2">
                    
                    {/* Left: Edit Room details button & Delete */}
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => setEditingRoom(room)}
                        className="px-2.5 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer shadow-3xs"
                        title="कमरा स्टेटस, किराया व विवरण बदलें"
                      >
                        <Edit3 className="w-3.5 h-3.5 text-indigo-600" />
                        <span>Edit</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeleteRoom(room.id, room.roomNumber)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all cursor-pointer"
                        title="कमरा डिलीट करें"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Right: Assign Student Button or Vacate / Maintenance toggles */}
                    {isFull && occupants.length > 0 ? (
                      <button
                        type="button"
                        onClick={() => handleQuickSetRoomStatus(room, 'available')}
                        className="py-1.5 px-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold rounded-xl transition-all flex items-center gap-1 cursor-pointer"
                        title="सभी छात्रों को हटाकर कमरा खाली करें"
                      >
                        <UserX className="w-3.5 h-3.5" />
                        <span>कमरा खाली करें</span>
                      </button>
                    ) : !isFull && !isMaintenance ? (
                      <button
                        type="button"
                        onClick={() => setAssignModalRoom(room)}
                        className="py-1.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-1 cursor-pointer"
                      >
                        <UserPlus className="w-3.5 h-3.5" />
                        <span>छात्र अलॉट करें</span>
                      </button>
                    ) : isMaintenance ? (
                      <button
                        type="button"
                        onClick={() => handleQuickSetRoomStatus(room, 'available')}
                        className="text-[11px] font-bold text-indigo-600 hover:underline cursor-pointer"
                      >
                        मरम्मत समाप्त करें
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleQuickSetRoomStatus(room, 'available')}
                        className="text-[11px] font-bold text-emerald-600 hover:underline cursor-pointer"
                      >
                        खाली मार्क करें
                      </button>
                    )}

                  </div>

                </div>
              );
            })}
          </div>
        )
      )}

      {/* ================= VIEW MODE 2: QUICK EDIT TABLE / SPREADSHEET ================= */}
      {viewMode === 'table' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-3xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase text-slate-500 tracking-wider">
                <tr>
                  <th className="py-3 px-4">कमरा नंबर</th>
                  <th className="py-3 px-3">तल (Floor)</th>
                  <th className="py-3 px-3">प्रकार (Type)</th>
                  <th className="py-3 px-3">स्थिति (Status)</th>
                  <th className="py-3 px-3">मासिक किराया (Rent)</th>
                  <th className="py-3 px-3">वर्तमान छात्र (Occupants)</th>
                  <th className="py-3 px-4 text-right">कार्रवाई (Actions)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredRooms.map((room) => {
                  const key = room.roomNumber.trim().toUpperCase();
                  const occupants = roomOccupancyMap[key] || [];
                  const capacity = room.capacity || (room.type === 'twin' ? 2 : 1);
                  const isManualOccupied = room.status === 'occupied' && occupants.length === 0;
                  const count = isManualOccupied ? capacity : occupants.length;
                  const isFull = count >= capacity;
                  const roomRent = room.customRent || (room.type === 'single' ? config.singleRoomRent : room.type === 'full' ? (config.fullRoomRent || 5500) : config.twinRoomRent);

                  return (
                    <tr key={room.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* Room Number */}
                      <td className="py-3 px-4 font-display font-black text-sm text-slate-900">
                        Room {room.roomNumber}
                      </td>

                      {/* Floor */}
                      <td className="py-3 px-3 text-slate-600 font-medium whitespace-nowrap">
                        {room.floor || 'Ground Floor'}
                      </td>

                      {/* Type */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md border ${
                          room.type === 'single' 
                            ? 'bg-indigo-50 text-indigo-700 border-indigo-200' 
                            : room.type === 'full'
                            ? 'bg-teal-50 text-teal-700 border-teal-200'
                            : 'bg-purple-50 text-purple-700 border-purple-200'
                        }`}>
                          {room.type === 'single' ? '1-Seater Single' : room.type === 'full' ? 'Full Room (निजी)' : '2-Seater Twin'}
                        </span>
                      </td>

                      {/* Status Dropdown */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        <select
                          value={room.status || (isFull ? 'occupied' : 'available')}
                          onChange={(e) => handleQuickSetRoomStatus(room, e.target.value as any)}
                          className="px-2 py-1 bg-white rounded-lg border border-slate-200 text-xs font-bold text-slate-700 cursor-pointer focus:ring-1 focus:ring-primary-500 shadow-3xs"
                        >
                          <option value="available">🟢 खाली (Empty)</option>
                          <option value="occupied">🔴 भरा हुआ (Occupied)</option>
                          <option value="reserved">🟡 आरक्षित (Reserved)</option>
                          <option value="maintenance">🛠️ मरम्मत (Blocked)</option>
                        </select>
                      </td>

                      {/* Rent */}
                      <td className="py-3 px-3 whitespace-nowrap font-black text-slate-900">
                        <span>₹{roomRent}</span>
                        {room.customRent ? (
                          <span className="text-[9px] text-amber-700 bg-amber-100 px-1 py-0.2 rounded ml-1 font-bold">Custom</span>
                        ) : (
                          <span className="text-[9px] text-slate-400 ml-1 font-normal">(डिफ़ॉल्ट)</span>
                        )}
                      </td>

                      {/* Occupants */}
                      <td className="py-3 px-3">
                        {occupants.length > 0 ? (
                          <div className="flex items-center gap-1 flex-wrap">
                            {occupants.map(o => (
                              <span key={o.id} className="bg-indigo-50 text-indigo-800 text-[10px] font-bold px-2 py-0.5 rounded border border-indigo-100">
                                {o.fullName}
                              </span>
                            ))}
                          </div>
                        ) : isManualOccupied ? (
                          <span className="text-[10px] font-bold text-slate-500">मैन्युअल ऑक्यूपाइड</span>
                        ) : (
                          <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                            ✓ खाली (0/{capacity})
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => setEditingRoom(room)}
                            className="px-2.5 py-1 bg-slate-100 hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                            title="विवरण एडिट करें"
                          >
                            <Edit3 className="w-3 h-3" />
                            <span>Edit</span>
                          </button>

                          {occupants.length > 0 && (
                            <button
                              type="button"
                              onClick={() => handleQuickSetRoomStatus(room, 'available')}
                              className="px-2 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg text-xs font-bold transition-all cursor-pointer"
                              title="खाली करें"
                            >
                              खाली करें
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => handleDeleteRoom(room.id, room.roomNumber)}
                            className="p-1 text-slate-400 hover:text-rose-600 rounded-lg transition-all cursor-pointer"
                            title="हटाएं"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ================= MODAL: EDIT ROOM DETAILS (विस्तृत कमरा संपादन) ================= */}
      {editingRoom && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 space-y-5 animate-scale-up max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-display font-black text-base text-slate-900 flex items-center gap-2">
                  <Edit3 className="w-5 h-5 text-indigo-600" />
                  <span>कमरा {editingRoom.roomNumber} का विवरण और किराया संपादित करें</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  स्थिति (खाली/भरा हुआ), प्रकार, विशेष किराया और सुविधाएं अपडेट करें
                </p>
              </div>
              <button
                type="button"
                onClick={() => setEditingRoom(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditRoom} className="space-y-4">
              
              {/* Quick Status Bar */}
              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-black text-slate-700">कमरे की स्थिति (Status)</label>
                  {/* Quick Empty button */}
                  <button
                    type="button"
                    onClick={handleModalEmptyRoom}
                    className="text-[11px] font-extrabold text-emerald-700 hover:text-emerald-900 bg-emerald-100 hover:bg-emerald-200 px-2 py-0.5 rounded-md transition-colors cursor-pointer flex items-center gap-1"
                  >
                    <Unlock className="w-3 h-3" />
                    <span>कमरा खाली (Empty) करें</span>
                  </button>
                </div>
                
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingRoom({ ...editingRoom, status: 'available' })}
                    className={`py-2 px-2.5 rounded-xl text-xs font-bold border transition-all text-center cursor-pointer ${
                      editingRoom.status === 'available' || !editingRoom.status
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-emerald-50'
                    }`}
                  >
                    🟢 खाली (Empty)
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingRoom({ ...editingRoom, status: 'occupied' })}
                    className={`py-2 px-2.5 rounded-xl text-xs font-bold border transition-all text-center cursor-pointer ${
                      editingRoom.status === 'occupied'
                        ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    🔴 भरा (Occupied)
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingRoom({ ...editingRoom, status: 'reserved' })}
                    className={`py-2 px-2.5 rounded-xl text-xs font-bold border transition-all text-center cursor-pointer ${
                      editingRoom.status === 'reserved'
                        ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-blue-50'
                    }`}
                  >
                    🟡 आरक्षित (Reserved)
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingRoom({ ...editingRoom, status: 'maintenance' })}
                    className={`py-2 px-2.5 rounded-xl text-xs font-bold border transition-all text-center cursor-pointer ${
                      editingRoom.status === 'maintenance'
                        ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-amber-50'
                    }`}
                  >
                    🛠️ मरम्मत (Blocked)
                  </button>
                </div>
              </div>

              {/* Room Number & Floor */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-600">कमरा नंबर</label>
                  <input
                    type="text"
                    value={editingRoom.roomNumber}
                    onChange={(e) => setEditingRoom({ ...editingRoom, roomNumber: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-200 text-xs font-bold"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-600">फ्लोर / तल</label>
                  <select
                    value={editingRoom.floor || 'Ground Floor'}
                    onChange={(e) => setEditingRoom({ ...editingRoom, floor: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-200 text-xs font-bold cursor-pointer"
                  >
                    <option value="Ground Floor (ग्राउंड फ्लोर)">Ground Floor</option>
                    <option value="1st Floor (प्रथम तल)">1st Floor</option>
                    <option value="2nd Floor (द्वितीय तल)">2nd Floor</option>
                    <option value="3rd Floor (तृतीय तल)">3rd Floor</option>
                  </select>
                </div>
              </div>

              {/* Room Type & Capacity */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-600">कमरा प्रकार (Room Type)</label>
                  <select
                    value={editingRoom.type}
                    onChange={(e) => {
                      const t = e.target.value as 'single' | 'twin' | 'full';
                      setEditingRoom({ 
                        ...editingRoom, 
                        type: t, 
                        capacity: t === 'twin' ? 2 : 1 
                      });
                    }}
                    className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-200 text-xs font-bold cursor-pointer"
                  >
                    <option value="single">Single (1-Seater)</option>
                    <option value="twin">Twin (2-Seater)</option>
                    <option value="full">Full Room (निजी पूरा कमरा)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-600">बेड क्षमता (Bed Capacity)</label>
                  <input
                    type="number"
                    min="1"
                    max="6"
                    value={editingRoom.capacity || (editingRoom.type === 'twin' ? 2 : 1)}
                    onChange={(e) => setEditingRoom({ ...editingRoom, capacity: parseInt(e.target.value, 10) || 1 })}
                    className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-200 text-xs font-bold"
                  />
                </div>
              </div>

              {/* Custom Rent Override */}
              <div className="space-y-1 bg-slate-50 p-3 rounded-2xl border border-slate-200">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-700">
                    इस कमरे का विशेष मासिक किराया (₹)
                  </label>
                  <span className="text-[10px] text-slate-500">
                    डिफ़ॉल्ट प्रकार किराया: ₹{editingRoom.type === 'single' ? config.singleRoomRent : editingRoom.type === 'full' ? (config.fullRoomRent || 5500) : config.twinRoomRent}
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <input
                    type="number"
                    placeholder={`डिफ़ॉल्ट लागू है (₹${editingRoom.type === 'single' ? config.singleRoomRent : editingRoom.type === 'full' ? (config.fullRoomRent || 5500) : config.twinRoomRent})`}
                    value={editingRoom.customRent || ''}
                    onChange={(e) => setEditingRoom({ ...editingRoom, customRent: e.target.value ? parseInt(e.target.value, 10) : undefined })}
                    className="flex-1 px-3 py-2 bg-white rounded-xl border border-slate-200 text-xs font-black text-slate-900"
                  />
                  {editingRoom.customRent && (
                    <button
                      type="button"
                      onClick={() => setEditingRoom({ ...editingRoom, customRent: undefined })}
                      className="px-3 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold rounded-xl whitespace-nowrap transition-colors"
                      title="डिफ़ॉल्ट किराया लागू करें"
                    >
                      डिफ़ॉल्ट करें
                    </button>
                  )}
                </div>
              </div>

              {/* Room Amenities Checkboxes */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-600">कमरे की सुविधाएं (Amenities & Features)</label>
                <div className="flex flex-wrap gap-1.5">
                  {COMMON_AMENITIES_OPTIONS.map(amenity => {
                    const isSelected = (editingRoom.amenities || []).includes(amenity);
                    return (
                      <button
                        key={amenity}
                        type="button"
                        onClick={() => {
                          const current = editingRoom.amenities || [];
                          const updated = isSelected 
                            ? current.filter(a => a !== amenity)
                            : [...current, amenity];
                          setEditingRoom({ ...editingRoom, amenities: updated });
                        }}
                        className={`text-[11px] font-bold px-2.5 py-1 rounded-lg border transition-all flex items-center gap-1 cursor-pointer ${
                          isSelected
                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-3xs'
                            : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {isSelected ? <CheckSquare className="w-3 h-3" /> : <Square className="w-3 h-3" />}
                        <span>{amenity}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-600">विशेष नोट / केयरटेकर निर्देश</label>
                <input
                  type="text"
                  placeholder="उदा. Attached balcony, Sunlight facing, Fan replaced"
                  value={editingRoom.notes || ''}
                  onChange={(e) => setEditingRoom({ ...editingRoom, notes: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-200 text-xs font-medium"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingRoom(null)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-all"
                >
                  रद्द करें
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>बदलाव सेव करें (Save Changes)</span>
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* ================= MODAL: ADD NEW ROOM ================= */}
      {isAddRoomOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-5 animate-scale-up">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-display font-black text-base text-slate-900 flex items-center gap-2">
                  <Plus className="w-5 h-5 text-primary-600" />
                  <span>नया कमरा जोड़ें (Add Room)</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  हॉस्टल में नया कमरा नंबर व फ्लोर शामिल करें
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsAddRoomOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddRoom} className="space-y-4">
              
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-600">कमरा नंबर</label>
                  <input
                    type="text"
                    placeholder="उदा. 107, 207"
                    value={newRoomNum}
                    onChange={(e) => setNewRoomNum(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-200 text-xs font-bold"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-600">फ्लोर / तल</label>
                  <select
                    value={newRoomFloor}
                    onChange={(e) => setNewRoomFloor(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-200 text-xs font-bold cursor-pointer"
                  >
                    <option value="Ground Floor (ग्राउंड फ्लोर)">Ground Floor</option>
                    <option value="1st Floor (प्रथम तल)">1st Floor</option>
                    <option value="2nd Floor (द्वितीय तल)">2nd Floor</option>
                    <option value="3rd Floor (तृतीय तल)">3rd Floor</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-600">प्रकार (Room Type)</label>
                  <select
                    value={newRoomType}
                    onChange={(e) => setNewRoomType(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-200 text-xs font-bold cursor-pointer"
                  >
                    <option value="single">Single (1-Seater)</option>
                    <option value="twin">Twin (2-Seater)</option>
                    <option value="full">Full Room (निजी पूरा कमरा)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-600">स्थिति (Status)</label>
                  <select
                    value={newRoomStatus}
                    onChange={(e) => setNewRoomStatus(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-200 text-xs font-bold cursor-pointer"
                  >
                    <option value="available">✓ खाली / उपलब्ध (Available)</option>
                    <option value="occupied">🔴 भरा हुआ (Occupied)</option>
                    <option value="maintenance">🛠️ मरम्मत (Maintenance)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-600">
                  विशेष मासिक किराया (वैकल्पिक / Optional)
                </label>
                <input
                  type="number"
                  placeholder={`डिफ़ॉल्ट ₹${newRoomType === 'single' ? config.singleRoomRent : newRoomType === 'full' ? (config.fullRoomRent || 5500) : config.twinRoomRent}`}
                  value={newRoomRent}
                  onChange={(e) => setNewRoomRent(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-200 text-xs font-bold"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-600">नोट्स</label>
                <input
                  type="text"
                  placeholder="उदा. Attached washroom, Balcony side"
                  value={newRoomNotes}
                  onChange={(e) => setNewRoomNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-200 text-xs font-medium"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddRoomOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-all"
                >
                  रद्द करें
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-primary-600 hover:bg-primary-700 text-white text-xs font-bold rounded-xl transition-all shadow-xs cursor-pointer"
                >
                  कमरा जोड़ें
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* ================= MODAL: ASSIGN STUDENT TO ROOM ================= */}
      {assignModalRoom && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 space-y-5 animate-scale-up max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-display font-black text-base text-slate-900 flex items-center gap-2">
                  <UserPlus className="w-5 h-5 text-emerald-600" />
                  <span>कमरा {assignModalRoom.roomNumber} में छात्र अलॉट करें</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  प्रकार: {assignModalRoom.type === 'single' ? 'Single (1-Seater)' : assignModalRoom.type === 'full' ? 'Full Room' : 'Twin (2-Seater)'} • फ्लोर: {assignModalRoom.floor}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setAssignModalRoom(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {unassignedStudents.length === 0 ? (
              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 text-center space-y-3">
                <div className="w-10 h-10 rounded-xl bg-slate-200 text-slate-500 flex items-center justify-center mx-auto">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-xs text-slate-800">कोई बिना अलॉटमेंट वाला छात्र नहीं है</h4>
                <p className="text-[11px] text-slate-500">
                  सभी सक्रिय छात्रों को पहले ही कमरा मिल चुका है। नया छात्र जोड़ने के लिए 'छात्र रिकॉर्ड्स' टैब में जाएं।
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                <span className="text-xs font-bold text-slate-600">अलॉट करने के लिए छात्र चुनें:</span>
                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  {unassignedStudents.map((student) => (
                    <div 
                      key={student.id}
                      className="bg-slate-50 hover:bg-emerald-50/50 p-3 rounded-xl border border-slate-200 hover:border-emerald-300 transition-all flex items-center justify-between gap-3"
                    >
                      <div className="min-w-0">
                        <h5 className="font-bold text-xs text-slate-900 truncate">
                          {student.fullName}
                        </h5>
                        <p className="text-[10px] text-slate-500">
                          {student.phone} • {student.studyYear} • मांगी गई पसंद: {student.roomType === 'single' ? 'Single' : student.roomType === 'full' ? 'Full Room' : 'Twin'}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleAssignStudent(student.id || '', assignModalRoom)}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg transition-all shadow-xs cursor-pointer whitespace-nowrap"
                      >
                        यह कमरा दें
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setAssignModalRoom(null)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                बंद करें
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ================= MODAL: SHIFT STUDENT TO ANOTHER ROOM ================= */}
      {shiftModalStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-5 animate-scale-up">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-display font-black text-base text-slate-900 flex items-center gap-2">
                  <ArrowRightLeft className="w-5 h-5 text-indigo-600" />
                  <span>कमरा शिफ्ट करें (Shift Room)</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  छात्र: <strong>{shiftModalStudent.fullName}</strong> (वर्तमान कमरा: {shiftModalStudent.roomNumber})
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShiftModalStudent(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleShiftStudent} className="space-y-4">
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-600">नया कमरा चुनें:</label>
                <select
                  value={targetShiftRoomNumber}
                  onChange={(e) => setTargetShiftRoomNumber(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-200 text-xs font-bold cursor-pointer"
                  required
                >
                  <option value="">-- नया कमरा नंबर चुनें --</option>
                  {roomsList
                    .filter(r => r.roomNumber.toUpperCase() !== shiftModalStudent.roomNumber?.toUpperCase() && r.status !== 'maintenance')
                    .map(r => {
                      const occupants = roomOccupancyMap[r.roomNumber.toUpperCase()] || [];
                      const capacity = r.capacity || (r.type === 'twin' ? 2 : 1);
                      const isFull = occupants.length >= capacity;
                      return (
                        <option 
                          key={r.id} 
                          value={r.roomNumber}
                          disabled={isFull}
                        >
                          Room {r.roomNumber} ({r.floor}) - {r.type === 'single' ? 'Single' : r.type === 'full' ? 'Full Room' : 'Twin'} {isFull ? '(FULL)' : `(${occupants.length}/${capacity} भरी)`}
                        </option>
                      );
                    })}
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShiftModalStudent(null)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  रद्द करें
                </button>
                <button
                  type="submit"
                  disabled={!targetShiftRoomNumber}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-all shadow-xs disabled:opacity-50 cursor-pointer"
                >
                  शिफ्ट करें
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}
