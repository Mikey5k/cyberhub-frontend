'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Shield, Briefcase, GraduationCap, Building, Home,
  BrainCircuit, PiggyBank, Users, Settings, Upload,
  Download, FileText, Edit, Trash2, Eye, Filter,
  Search, CheckCircle, XCircle, Clock, AlertCircle,
  BarChart, PieChart, DollarSign, MapPin, Calendar,
  MessageCircle, Phone, Mail, User, Key, Globe,
  Wifi, Coffee, Book, TrendingUp, Square, ShieldCheck,
  RefreshCw, MoreVertical, ArrowUpDown, ChevronDown,
  ChevronRight, Plus, Minus, X, Check, Loader,
  FileEdit, Database, Server, Cloud, Terminal,
  Code, Palette, Bell, Settings as SettingsIcon,
  Lock, Unlock, EyeOff, Eye as EyeIcon, DownloadCloud,
  UploadCloud, Database as DatabaseIcon, HardDrive,
  Cpu, MemoryStick, Network, Shield as ShieldIcon,
  BookOpen, Award, Bed, Laptop, Smartphone, Tablet,
  Monitor, Printer, Router, Server as ServerIcon,
  Cloud as CloudIcon, Zap, Battery, Power, Activity,
  Thermometer, Droplets, Sun, Moon, Star, Crown,
  Target, TrendingDown, PieChart as PieChartIcon,
  BarChart as BarChartIcon, LineChart, DollarSign as DollarIcon,
  CreditCard, Wallet, Banknote, Coins, Receipt,
  Calculator, Percent, ArrowUpRight, ArrowDownRight,
  ArrowLeftRight, Maximize2, Minimize2, RotateCcw,
  Play, Pause, Stop, SkipBack, SkipForward, FastForward,
  Rewind, Volume2, VolumeX, Mic, MicOff, Video,
  VideoOff, Camera, CameraOff, Headphones, Radio,
  Music, Speaker, BellOff, BellRing, Heart,
  ThumbsUp, ThumbsDown, Flag, FlagOff, Bookmark,
  BookmarkCheck, Share2, ExternalLink, Link,
  Link2, Unlink, LockKeyhole, KeyRound, Fingerprint,
  ScanFace, QrCode, Barcode, Hash, AtSign,
  Asterisk, PlusCircle, MinusCircle, XCircle as XCircleIcon,
  CheckCircle as CheckCircleIcon, HelpCircle,
  Info, AlertTriangle, AlertOctagon, AlertCircle as AlertCircleIcon,
  Ban, RadioTower, Satellite, WifiOff, Bluetooth,
  Usb, Cpu as CpuIcon, HardDrive as HardDriveIcon,
  MemoryStick as MemoryStickIcon, Printer as PrinterIcon,
  Mouse, Keyboard, Monitor as MonitorIcon, Smartphone as SmartphoneIcon,
  Tablet as TabletIcon, Watch, Tv, Projector,
  GamepadIcon, Joystick, Puzzle, Dice5, ChessKing,
  Music2, Music3, Music4, Disc, Album, Tape,
  Film, Clapperboard, Tv2, Video as VideoIcon,
  Youtube, Twitch, Instagram, Facebook, Twitter,
  Linkedin, Github, Gitlab, GitBranch, GitCommit,
  GitPullRequest, GitMerge, Code2, Brackets,
  Braces, Parentheses, Slash, Backslash, CurlyBraces,
  AngleBrackets, Command, Option, Control, Shift,
  Escape, Enter, Space, Delete, Backspace, Tab,
  CapsLock, ShiftIcon as ShiftKey, Option as OptionKey,
  Control as ControlKey, Command as CommandKey,
  Windows, Apple, Linux, Chrome, Firefox, Safari,
  Edge, Opera, InternetExplorer, Chrome as ChromeIcon,
  Firefox as FirefoxIcon, Safari as SafariIcon,
  Edge as EdgeIcon, Opera as OperaIcon, Globe2,
  CloudRain, CloudSnow, CloudLightning, CloudDrizzle,
  CloudFog, Sun as SunIcon, Moon as MoonIcon,
  Star as StarIcon, Cloud as CloudIcon2, Umbrella,
  Wind, Thermometer as ThermometerIcon, Droplets as DropletsIcon,
  Flame, Snowflake, Trees, Mountain, Waves,
  Ship, Anchor, Car, Bike, Bus, Train,
  Tram, Plane, Rocket, UFO, Satellite as SatelliteIcon,
  Robot, Ghost, Skull, Alien, Astronaut,
  Medal, Trophy, Cup, Crown as CrownIcon,
  Gem, Diamond, Heart as HeartIcon, Star as StarIcon2,
  Moon as MoonIcon2, Sun as SunIcon2, Cloud as CloudIcon3,
  Zap as ZapIcon, Flame as FlameIcon, Droplets as DropletsIcon2,
  Snowflake as SnowflakeIcon, Wind as WindIcon,
  Umbrella as UmbrellaIcon, Trees as TreesIcon,
  Mountain as MountainIcon, Waves as WavesIcon,
  Ship as ShipIcon, Anchor as AnchorIcon, Car as CarIcon,
  Bike as BikeIcon, Bus as BusIcon, Train as TrainIcon,
  Tram as TramIcon, Plane as PlaneIcon, Rocket as RocketIcon,
  UFO as UFOIcon, Satellite as SatelliteIcon2,
  Robot as RobotIcon, Ghost as GhostIcon, Skull as SkullIcon,
  Alien as AlienIcon, Astronaut as AstronautIcon,
  Medal as MedalIcon, Trophy as TrophyIcon, Cup as CupIcon,
  Crown as CrownIcon2, Gem as GemIcon, Diamond as DiamondIcon,
  Heart as HeartIcon2, Star as StarIcon3, Moon as MoonIcon3,
  Sun as SunIcon3, Cloud as CloudIcon4, Zap as ZapIcon2,
  Flame as FlameIcon2, Droplets as DropletsIcon3,
  Snowflake as SnowflakeIcon2, Wind as WindIcon2,
  Umbrella as UmbrellaIcon2, Trees as TreesIcon2,
  Mountain as MountainIcon2, Waves as WavesIcon2,
  Ship as ShipIcon2, Anchor as AnchorIcon2, Car as CarIcon2,
  Bike as BikeIcon2, Bus as BusIcon2, Train as TrainIcon2,
  Tram as TramIcon2, Plane as PlaneIcon2, Rocket as RocketIcon2,
  UFO as UFOIcon2, Satellite as SatelliteIcon3,
  Robot as RobotIcon2, Ghost as GhostIcon2, Skull as SkullIcon2,
  Alien as AlienIcon2, Astronaut as AstronautIcon2,
  Medal as MedalIcon2, Trophy as TrophyIcon2, Cup as CupIcon2,
  Crown as CrownIcon3, Gem as GemIcon2, Diamond as DiamondIcon2,
  Heart as HeartIcon3, Star as StarIcon4, Moon as MoonIcon4,
  Sun as SunIcon4, Cloud as CloudIcon5, Zap as ZapIcon3,
  Flame as FlameIcon3, Droplets as DropletsIcon4,
  Snowflake as SnowflakeIcon3, Wind as WindIcon3,
  Umbrella as UmbrellaIcon3, Trees as TreesIcon3,
  Mountain as MountainIcon3, Waves as WavesIcon3,
  Ship as ShipIcon3, Anchor as AnchorIcon3, Car as CarIcon3,
  Bike as BikeIcon3, Bus as BusIcon3, Train as TrainIcon3,
  Tram as TramIcon3, Plane as PlaneIcon3, Rocket as RocketIcon3,
  UFO as UFOIcon3, Satellite as SatelliteIcon4,
  Robot as RobotIcon3, Ghost as GhostIcon3, Skull as SkullIcon3,
  Alien as AlienIcon3, Astronaut as AstronautIcon3
} from 'lucide-react';

interface ContentItem {
  id: string;
  title: string;
  description: string;
  category: string;
  type: 'job' | 'bursary' | 'scholarship' | 'internship' | 'hostel' | 'government';
  postedDate: string;
  deadline?: string;
  location?: string;
  institution?: string;
  amount?: number;
  duration?: string;
  requirements?: string[];
  contact?: string;
  status: 'active' | 'expired' | 'draft' | 'pending_approval' | 'approved' | 'rejected';
  specificType?: string;
  amenities?: string[];
  salaryRange?: string;
  jobType?: string;
  fieldOfStudy?: string;
  academicLevel?: string;
  distanceFromCampus?: string;
  createdBy?: string;
  approvedBy?: string;
  createdAt?: string;
}

interface UploadResult {
  success: boolean;
  message: string;
  count?: number;
  duplicates?: string[];
  error?: string;
}

interface ConfigSection {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  fields: ConfigField[];
}

interface ConfigField {
  id: string;
  label: string;
  type: 'text' | 'number' | 'select' | 'textarea' | 'toggle' | 'color';
  value: any;
  options?: string[];
  placeholder?: string;
  helpText?: string;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [phone, setPhone] = useState<string>('');
  const [role, setRole] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'upload' | 'config' | 'content'>('upload');
  const [selectedContentType, setSelectedContentType] = useState<'jobs' | 'bursaries' | 'scholarships' | 'internships' | 'hostels' | 'e-citizen'>('jobs');
  const [csvData, setCsvData] = useState<string>('');
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<UploadResult | null>(null);
  const [configSections, setConfigSections] = useState<ConfigSection[]>([]);
  const [contentItems, setContentItems] = useState<ContentItem[]>([]);
  const [loadingContent, setLoadingContent] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingItem, setEditingItem] = useState<ContentItem | null>(null);
  const [editForm, setEditForm] = useState({
    title: '',
    description: '',
    amount: '',
    location: '',
    institution: '',
    deadline: '',
    duration: '',
    requirements: ''
  });

  // Content type configurations
  const contentTypes = [
    { id: 'jobs', name: 'Job Opportunities', icon: <Briefcase className="h-4 w-4" />, color: 'blue' },
    { id: 'bursaries', name: 'Bursaries', icon: <PiggyBank className="h-4 w-4" />, color: 'green' },
    { id: 'scholarships', name: 'Scholarships', icon: <Award className="h-4 w-4" />, color: 'purple' },
    { id: 'internships', name: 'Internships', icon: <BrainCircuit className="h-4 w-4" />, color: 'orange' },
    { id: 'hostels', name: 'Hostels', icon: <Home className="h-4 w-4" />, color: 'pink' },
    { id: 'e-citizen', name: 'E-Citizen Services', icon: <Shield className="h-4 w-4" />, color: 'indigo' },
  ];

  // Get phone and role from localStorage
  useEffect(() => {
    const savedPhone = localStorage.getItem('cyberhub_phone') || sessionStorage.getItem('cyberhub_phone');
    const savedRole = localStorage.getItem('cyberhub_role') || sessionStorage.getItem('cyberhub_role');
    
    if (savedPhone) setPhone(savedPhone);
    if (savedRole) setRole(savedRole);
    
    // Redirect non-admin users
    if (savedRole !== 'admin') {
      router.push('/login?redirect=/admin-dashboard');
    }
    
    // Load initial content
    fetchContent();
    loadConfigSections();
  }, []);

  // Fetch content based on selected type
  const fetchContent = async () => {
    try {
      setLoadingContent(true);
      const typeMap: Record<string, string> = {
        'jobs': 'job',
        'bursaries': 'bursary',
        'scholarships': 'scholarship',
        'internships': 'internship',
        'hostels': 'hostel',
        'e-citizen': 'government'
      };
      
      const response = await fetch(`/api/jobs?type=${typeMap[selectedContentType]}&phone=${phone}&role=admin`);
      const result = await response.json();
      
      if (result.success) {
        setContentItems(result.data || []);
      } else {
        console.error('Failed to fetch content:', result.error);
        setContentItems([]);
      }
    } catch (error) {
      console.error('Error fetching content:', error);
      setContentItems([]);
    } finally {
      setLoadingContent(false);
      setRefreshing(false);
    }
  };

  // Handle refresh
  const handleRefresh = () => {
    console.log('🔄 Admin: Manual refresh triggered');
    setRefreshing(true);
    fetchContent();
  };

  // Handle CSV upload
  const handleCsvUpload = async () => {
    if (!csvData.trim()) {
      setUploadResult({ success: false, message: 'Please paste CSV data' });
      return;
    }

    setUploading(true);
    setUploadResult(null);

    try {
      const response = await fetch('/api/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'bulkUpload',
          type: selectedContentType,
          csvData: csvData,
          phone: phone,
          role: 'admin'
        })
      });

      const result = await response.json();
      setUploadResult(result);

      if (result.success) {
        setCsvData('');
        // Auto-refresh content after successful upload
        setTimeout(() => {
          fetchContent();
        }, 1000);
      }
    } catch (error) {
      console.error('Upload error:', error);
      setUploadResult({
        success: false,
        message: 'Network error. Please try again.',
        error: String(error)
      });
    } finally {
      setUploading(false);
    }
  };

  // Handle edit
  const handleEdit = (item: ContentItem) => {
    setEditingItem(item);
    setEditForm({
      title: item.title,
      description: item.description,
      amount: item.amount?.toString() || '',
      location: item.location || '',
      institution: item.institution || '',
      deadline: item.deadline || '',
      duration: item.duration || '',
      requirements: item.requirements?.join(', ') || ''
    });
    setShowEditModal(true);
  };

  // Handle save edit
  const handleSaveEdit = async () => {
    if (!editingItem) return;

    try {
      const response = await fetch(`/api/jobs?id=${editingItem.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...editForm,
          amount: editForm.amount ? parseInt(editForm.amount) : 0,
          requirements: editForm.requirements.split(',').map(r => r.trim()).filter(r => r)
        })
      });

      const result = await response.json();
      
      if (result.success) {
        // Update local state
        setContentItems(prev => prev.map(item => 
          item.id === editingItem.id 
            ? { ...item, ...editForm, amount: editForm.amount ? parseInt(editForm.amount) : 0 }
            : item
        ));
        setShowEditModal(false);
        setEditingItem(null);
        alert('Content updated successfully!');
      } else {
        alert('Failed to update: ' + (result.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error updating content:', error);
      alert('Error updating content. Please try again.');
    }
  };

  // Handle delete
  const handleDelete = async (item: ContentItem) => {
    if (!confirm(`Are you sure you want to delete "${item.title}"?`)) return;

    try {
      const response = await fetch(`/api/jobs?id=${item.id}`, {
        method: 'DELETE',
      });

      const result = await response.json();
      
      if (result.success) {
        // Remove from local state
        setContentItems(prev => prev.filter(content => content.id !== item.id));
        alert('Content deleted successfully!');
      } else {
        alert('Failed to delete: ' + (result.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error deleting content:', error);
      alert('Error deleting content. Please try again.');
    }
  };

  // Load config sections
  const loadConfigSections = () => {
    const sections: ConfigSection[] = [
      {
        id: 'general',
        title: 'General Settings',
        description: 'Basic platform configuration',
        icon: <Settings className="h-5 w-5" />,
        fields: [
          { id: 'platformName', label: 'Platform Name', type: 'text', value: 'Veritas CyberHub' },
          { id: 'currency', label: 'Currency', type: 'select', value: 'KES', options: ['KES', 'USD', 'EUR'] },
          { id: 'whatsappNumber', label: 'WhatsApp Support Number', type: 'text', value: '+254708949580' },
          { id: 'supportEmail', label: 'Support Email', type: 'text', value: 'support@veritascyberhub.com' },
        ]
      },
      {
        id: 'pricing',
        title: 'Pricing Configuration',
        description: 'Subscription and service pricing',
        icon: <DollarSign className="h-5 w-5" />,
        fields: [
          { id: 'basicPrice', label: 'Basic Plan (Monthly)', type: 'number', value: 50 },
          { id: 'premiumPrice', label: 'Premium Plan (Monthly)', type: 'number', value: 300 },
          { id: 'assistedApplication', label: 'Assisted Application Fee', type: 'number', value: 500 },
          { id: 'autoApplication', label: 'Auto Application Fee', type: 'number', value: 3000 },
        ]
      },
      {
        id: 'appearance',
        title: 'Appearance',
        description: 'UI/UX customization',
        icon: <Palette className="h-5 w-5" />,
        fields: [
          { id: 'primaryColor', label: 'Primary Color', type: 'color', value: '#ff6b35' },
          { id: 'secondaryColor', label: 'Secondary Color', type: 'color', value: '#ffa500' },
          { id: 'darkMode', label: 'Dark Mode', type: 'toggle', value: false },
        ]
      }
    ];
    setConfigSections(sections);
  };

  // Update config field
  const updateConfigField = (sectionId: string, fieldId: string, value: any) => {
    setConfigSections(prev => prev.map(section => {
      if (section.id === sectionId) {
        return {
          ...section,
          fields: section.fields.map(field => 
            field.id === fieldId ? { ...field, value } : field
          )
        };
      }
      return section;
    }));
  };

  // Save all config
  const saveAllConfig = async () => {
    try {
      const allConfig: any = {};
      configSections.forEach(section => {
        section.fields.forEach(field => {
          allConfig[field.id] = field.value;
        });
      });

      const response = await fetch('/api/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(allConfig)
      });

      const result = await response.json();
      if (result.success) {
        alert('Configuration saved successfully!');
      } else {
        alert('Failed to save configuration');
      }
    } catch (error) {
      console.error('Error saving config:', error);
      alert('Error saving configuration');
    }
  };

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem('cyberhub_phone');
    localStorage.removeItem('cyberhub_role');
    sessionStorage.removeItem('cyberhub_phone');
    sessionStorage.removeItem('cyberhub_role');
    router.push('/login');
  };

  // Format amount
  const formatAmount = (amount?: number) => {
    if (!amount) return 'Negotiable';
    return `KES ${amount.toLocaleString()}`;
  };

  // Format date
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  // Get CSV template
  const getCsvTemplate = () => {
    const templates: Record<string, string> = {
      'jobs': 'title,description,category,type,location,institution,amount,duration,requirements,jobType,salaryRange\nSoftware Developer,Build amazing software,Technology,job,Nairobi,Google Inc,150000,Full-time,"Bachelor in CS, 2+ years experience",Full-time,"150,000 - 200,000"\nData Analyst,Analyze business data,Business,job,Remote,Amazon,120000,Contract,"Statistics degree, SQL skills",Remote,"100,000 - 150,000"',
      'bursaries': 'title,description,category,type,location,institution,amount,deadline,fieldOfStudy,academicLevel,requirements\nGovernment Bursary,Financial aid for students,Education,bursary,Nairobi,Ministry of Education,50000,2024-03-31,"All fields",Undergraduate,"Kenyan citizen, Need-based"\nCounty Bursary,County government bursary,Education,bursary,Mombasa,Mombasa County,40000,2024-04-15,"Medicine, Engineering",Diploma,"County resident, Good grades"',
      'scholarships': 'title,description,category,type,location,institution,amount,deadline,fieldOfStudy,academicLevel,requirements\nMastercard Scholarship,Full scholarship for Africans,Education,scholarship,Nairobi,Mastercard Foundation,0,2024-02-28,"All fields",Undergraduate,"African citizen, Leadership potential"\nCoca-Cola Scholarship,Business scholarship,Education,scholarship,Nairobi,Coca-Cola,300000,2024-03-15,"Business, Marketing",Masters,"Entrepreneurial spirit"',
      'internships': 'title,description,category,type,location,institution,amount,duration,fieldOfStudy,requirements\nSoftware Engineering Intern,Learn software development,Technology,internship,Nairobi,Safaricom,30000,6 months,"Computer Science","Programming skills, CS student"\nMarketing Intern,Digital marketing experience,Marketing,internship,Remote,Digitize Africa,25000,3 months,"Marketing, Business","Social media skills"',
      'hostels': 'title,description,category,type,location,institution,amount,duration,amenities,distanceFromCampus\nUniversity Hostel,Secure student accommodation,Accommodation,hostel,Nairobi,UoN,15000,Academic year,"WiFi,Study Area,Security","On-campus"\nPrivate Hostel,Modern student hostel,Accommodation,hostel,Nairobi,Prime Hostels,18000,Monthly,"WiFi,Gym,Laundry,Cafeteria","Walking distance"',
      'e-citizen': 'title,description,category,type,location,institution,amount,requirements,contact\nPassport Application,Apply for Kenyan passport,Government,government,Nairobi,Immigration Department,4500,"ID copy, Photos, Birth certificate",immigration@government.go.ke\nID Replacement,Replace lost ID card,Government,government,Nairobi,Registration Bureau,1000,"Police abstract, Old ID details",+254722000000'
    };
    return templates[selectedContentType] || '';
  };

  // Copy template to clipboard
  const copyTemplate = () => {
    navigator.clipboard.writeText(getCsvTemplate());
    alert('CSV template copied to clipboard!');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-200/50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center">
              <div className="flex items-center gap-2">
                <div className="bg-gradient-to-r from-[#ff6b35] to-[#ffa500] p-2 rounded-lg">
                  <ShieldCheck className="h-5 w-5 text-white" />
                </div>
                <span className="text-xl font-black bg-gradient-to-r from-[#ff6b35] to-[#ffa500] bg-clip-text text-transparent">
                  Veritas
                </span>
              </div>
              <span className="ml-2 text-gray-700 font-semibold">Admin Dashboard</span>
            </div>
            
            <div className="flex items-center gap-4">
              {phone && (
                <div className="hidden md:flex items-center gap-2 bg-gray-100 rounded-full px-4 py-2">
                  <Phone className="h-4 w-4 text-gray-600" />
                  <span className="text-sm font-medium text-gray-700">{phone}</span>
                  <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-medium rounded-full">
                    Admin
                  </span>
                </div>
              )}
              
              {/* Refresh Button - ADDED HERE */}
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                <span className="text-sm font-medium">Refresh</span>
              </button>
              
              <button
                onClick={handleLogout}
                className="text-sm font-semibold text-gray-600 hover:text-gray-900 px-3 py-1.5 rounded-lg hover:bg-gray-100"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="flex border-b border-gray-200 mb-8">
          <button
            onClick={() => setActiveTab('upload')}
            className={`flex items-center gap-2 px-4 py-3 font-medium border-b-2 transition-colors ${
              activeTab === 'upload'
                ? 'border-[#ff6b35] text-[#ff6b35]'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Upload className="h-4 w-4" />
            CSV Upload
          </button>
          <button
            onClick={() => setActiveTab('content')}
            className={`flex items-center gap-2 px-4 py-3 font-medium border-b-2 transition-colors ${
              activeTab === 'content'
                ? 'border-[#ff6b35] text-[#ff6b35]'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <DatabaseIcon className="h-4 w-4" />
            Content Manager
          </button>
          <button
            onClick={() => setActiveTab('config')}
            className={`flex items-center gap-2 px-4 py-3 font-medium border-b-2 transition-colors ${
              activeTab === 'config'
                ? 'border-[#ff6b35] text-[#ff6b35]'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Settings className="h-4 w-4" />
            Config Manager
          </button>
        </div>

        {/* CSV Upload Tab */}
        {activeTab === 'upload' && (
          <div className="bg-white rounded-2xl border-2 border-gray-200 p-6 shadow-lg">
            <h2 className="text-2xl font-black text-gray-900 mb-2">Universal CSV Upload</h2>
            <p className="text-gray-600 mb-6">Bulk upload content for all categories</p>

            {/* Content Type Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">Select Content Type</label>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                {contentTypes.map(type => (
                  <button
                    key={type.id}
                    onClick={() => setSelectedContentType(type.id as any)}
                    className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-colors ${
                      selectedContentType === type.id
                        ? `border-${type.color}-300 bg-${type.color}-50`
                        : 'border-gray-300 bg-gray-50 hover:bg-gray-100'
                    }`}
                  >
                    <div className={`p-3 rounded-lg mb-2 ${
                      selectedContentType === type.id 
                        ? `bg-${type.color}-100 text-${type.color}-600`
                        : 'bg-gray-200 text-gray-600'
                    }`}>
                      {type.icon}
                    </div>
                    <span className="text-sm font-medium text-gray-700 text-center">{type.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* CSV Input */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <label className="block text-sm font-medium text-gray-700">
                  Paste CSV Data
                </label>
                <button
                  onClick={copyTemplate}
                  className="text-sm text-[#ff6b35] hover:text-[#ff8552] font-medium"
                >
                  Copy Template
                </button>
              </div>
              <textarea
                value={csvData}
                onChange={(e) => setCsvData(e.target.value)}
                placeholder="Paste your CSV data here (with headers)..."
                className="w-full h-64 px-4 py-3 bg-gray-50 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-[#ff6b35] focus:border-transparent font-mono text-sm"
                spellCheck={false}
              />
              <p className="mt-2 text-sm text-gray-500">
                CSV format: Use commas to separate values, first row as headers
              </p>
            </div>

            {/* Upload Button */}
            <button
              onClick={handleCsvUpload}
              disabled={uploading || !csvData.trim()}
              className="w-full py-4 bg-gradient-to-r from-[#ff6b35] to-[#ffa500] text-white font-bold rounded-xl hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {uploading ? (
                <>
                  <Loader className="h-5 w-5 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="h-5 w-5" />
                  Upload {contentTypes.find(t => t.id === selectedContentType)?.name}
                </>
              )}
            </button>

            {/* Upload Result */}
            {uploadResult && (
              <div className={`mt-6 p-4 rounded-xl ${
                uploadResult.success 
                  ? 'bg-green-50 border border-green-200' 
                  : 'bg-red-50 border border-red-200'
              }`}>
                <div className="flex items-start gap-3">
                  {uploadResult.success ? (
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
                  )}
                  <div>
                    <p className={`font-medium ${
                      uploadResult.success ? 'text-green-800' : 'text-red-800'
                    }`}>
                      {uploadResult.message}
                    </p>
                    {uploadResult.count !== undefined && (
                      <p className="text-sm text-green-700 mt-1">
                        Successfully uploaded {uploadResult.count} items
                      </p>
                    )}
                    {uploadResult.duplicates && uploadResult.duplicates.length > 0 && (
                      <p className="text-sm text-yellow-700 mt-1">
                        Found {uploadResult.duplicates.length} duplicate(s) - skipped
                      </p>
                    )}
                    {uploadResult.error && (
                      <p className="text-sm text-red-700 mt-1 font-mono">
                        {uploadResult.error}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Content Manager Tab */}
        {activeTab === 'content' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border-2 border-gray-200 p-6 shadow-lg">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-black text-gray-900">Content Manager</h2>
                  <p className="text-gray-600">Manage all uploaded content</p>
                </div>
                <div className="flex items-center gap-3">
                  {/* Content Type Filter */}
                  <select
                    value={selectedContentType}
                    onChange={(e) => setSelectedContentType(e.target.value as any)}
                    className="px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-700"
                  >
                    {contentTypes.map(type => (
                      <option key={type.id} value={type.id}>
                        {type.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Content List */}
              <div className="space-y-4">
                {loadingContent ? (
                  <div className="text-center py-12">
                    <Loader className="h-8 w-8 text-blue-600 animate-spin mx-auto mb-4" />
                    <p className="text-gray-600">Loading content...</p>
                  </div>
                ) : contentItems.length > 0 ? (
                  contentItems.map(item => (
                    <div
                      key={item.id}
                      className="bg-gray-50 rounded-xl border border-gray-300 p-4 hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <div className={`p-2 rounded-lg ${
                              item.type === 'job' ? 'bg-blue-100 text-blue-600' :
                              item.type === 'internship' ? 'bg-orange-100 text-orange-600' :
                              item.type === 'bursary' ? 'bg-green-100 text-green-600' :
                              item.type === 'scholarship' ? 'bg-purple-100 text-purple-600' :
                              item.type === 'hostel' ? 'bg-pink-100 text-pink-600' :
                              'bg-gray-100 text-gray-600'
                            }`}>
                              {item.type === 'job' ? <Briefcase className="h-4 w-4" /> :
                               item.type === 'internship' ? <BrainCircuit className="h-4 w-4" /> :
                               item.type === 'bursary' ? <PiggyBank className="h-4 w-4" /> :
                               item.type === 'scholarship' ? <Award className="h-4 w-4" /> :
                               item.type === 'hostel' ? <Home className="h-4 w-4" /> :
                               <Shield className="h-4 w-4" />}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <h3 className="font-bold text-gray-900">{item.title}</h3>
                                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                    item.status === 'active' || item.status === 'approved' ? 'bg-green-100 text-green-700' :
                                    item.status === 'pending_approval' ? 'bg-yellow-100 text-yellow-700' :
                                    item.status === 'rejected' ? 'bg-red-100 text-red-700' :
                                    item.status === 'draft' ? 'bg-gray-100 text-gray-700' :
                                    'bg-blue-100 text-blue-700'
                                  }`}>
                                    {item.status}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2">
                                  {/* Edit and Delete Buttons - ADDED HERE */}
                                  <button
                                    onClick={() => handleEdit(item)}
                                    className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg"
                                    title="Edit"
                                  >
                                    <Edit className="h-4 w-4" />
                                  </button>
                                  <button
                                    onClick={() => handleDelete(item)}
                                    className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg"
                                    title="Delete"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </button>
                                </div>
                              </div>
                              <p className="text-gray-600 text-sm mt-1">{item.description}</p>
                              <div className="flex flex-wrap gap-4 mt-3">
                                {item.institution && (
                                  <div className="flex items-center gap-1 text-sm text-gray-700">
                                    <Building className="h-3 w-3" />
                                    {item.institution}
                                  </div>
                                )}
                                {item.location && (
                                  <div className="flex items-center gap-1 text-sm text-gray-700">
                                    <MapPin className="h-3 w-3" />
                                    {item.location}
                                  </div>
                                )}
                                {item.amount && (
                                  <div className="flex items-center gap-1 text-sm text-gray-700">
                                    <DollarSign className="h-3 w-3" />
                                    {formatAmount(item.amount)}
                                  </div>
                                )}
                                {item.deadline && (
                                  <div className="flex items-center gap-1 text-sm text-red-600">
                                    <Calendar className="h-3 w-3" />
                                    Due: {formatDate(item.deadline)}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12 bg-gray-50 rounded-xl border border-gray-300">
                    <div className="bg-gradient-to-r from-blue-100 to-blue-200 p-4 rounded-2xl inline-block mb-4">
                      <DatabaseIcon className="h-12 w-12 text-blue-600" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">No Content Found</h3>
                    <p className="text-gray-600 mb-6">
                      Upload some {contentTypes.find(t => t.id === selectedContentType)?.name.toLowerCase()} using the CSV Upload tab
                    </p>
                    <button
                      onClick={() => setActiveTab('upload')}
                      className="px-6 py-2 bg-gradient-to-r from-[#ff6b35] to-[#ffa500] text-white font-bold rounded-lg hover:opacity-90"
                    >
                      Go to CSV Upload
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Config Manager Tab */}
        {activeTab === 'config' && (
          <div className="bg-white rounded-2xl border-2 border-gray-200 p-6 shadow-lg">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-black text-gray-900">Config Manager</h2>
                <p className="text-gray-600">No-code configuration interface</p>
              </div>
              <button
                onClick={saveAllConfig}
                className="px-4 py-2 bg-gradient-to-r from-[#ff6b35] to-[#ffa500] text-white font-bold rounded-lg hover:opacity-90"
              >
                Save All Changes
              </button>
            </div>

            <div className="space-y-6">
              {configSections.map(section => (
                <div key={section.id} className="border border-gray-300 rounded-xl p-5">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 rounded-lg bg-blue-100 text-blue-600">
                      {section.icon}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">{section.title}</h3>
                      <p className="text-sm text-gray-600">{section.description}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {section.fields.map(field => (
                      <div key={field.id}>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {field.label}
                          {field.helpText && (
                            <span className="text-xs text-gray-500 ml-2">{field.helpText}</span>
                          )}
                        </label>
                        
                        {field.type === 'text' || field.type === 'number' ? (
                          <input
                            type={field.type}
                            value={field.value}
                            onChange={(e) => updateConfigField(section.id, field.id, e.target.value)}
                            className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg"
                            placeholder={field.placeholder}
                          />
                        ) : field.type === 'select' ? (
                          <select
                            value={field.value}
                            onChange={(e) => updateConfigField(section.id, field.id, e.target.value)}
                            className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg"
                          >
                            {field.options?.map(option => (
                              <option key={option} value={option}>{option}</option>
                            ))}
                          </select>
                        ) : field.type === 'textarea' ? (
                          <textarea
                            value={field.value}
                            onChange={(e) => updateConfigField(section.id, field.id, e.target.value)}
                            className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg"
                            rows={3}
                            placeholder={field.placeholder}
                          />
                        ) : field.type === 'toggle' ? (
                          <button
                            onClick={() => updateConfigField(section.id, field.id, !field.value)}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full ${
                              field.value ? 'bg-green-500' : 'bg-gray-300'
                            }`}
                          >
                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                              field.value ? 'translate-x-6' : 'translate-x-1'
                            }`} />
                          </button>
                        ) : field.type === 'color' ? (
                          <div className="flex items-center gap-3">
                            <input
                              type="color"
                              value={field.value}
                              onChange={(e) => updateConfigField(section.id, field.id, e.target.value)}
                              className="h-10 w-10 cursor-pointer"
                            />
                            <input
                              type="text"
                              value={field.value}
                              onChange={(e) => updateConfigField(section.id, field.id, e.target.value)}
                              className="flex-1 px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg font-mono"
                            />
                          </div>
                        ) : null}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Edit Modal */}
      {showEditModal && editingItem && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Edit Content</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  value={editForm.title}
                  onChange={(e) => setEditForm({...editForm, title: e.target.value})}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={editForm.description}
                  onChange={(e) => setEditForm({...editForm, description: e.target.value})}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg"
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Amount (KES)</label>
                  <input
                    type="number"
                    value={editForm.amount}
                    onChange={(e) => setEditForm({...editForm, amount: e.target.value})}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                  <input
                    type="text"
                    value={editForm.location}
                    onChange={(e) => setEditForm({...editForm, location: e.target.value})}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Institution/Organization</label>
                <input
                  type="text"
                  value={editForm.institution}
                  onChange={(e) => setEditForm({...editForm, institution: e.target.value})}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Requirements (comma separated)</label>
                <textarea
                  value={editForm.requirements}
                  onChange={(e) => setEditForm({...editForm, requirements: e.target.value})}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg"
                  rows={2}
                />
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-gray-200 flex gap-3">
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setEditingItem(null);
                }}
                className="flex-1 py-3 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                className="flex-1 py-3 bg-gradient-to-r from-[#ff6b35] to-[#ffa500] text-white font-bold rounded-xl hover:opacity-90"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="mt-12 py-8 border-t border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center gap-2 mb-6">
            <div className="bg-gradient-to-r from-[#ff6b35] to-[#ffa500] p-2 rounded-lg">
              <ShieldCheck className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-black bg-gradient-to-r from-[#ff6b35] to-[#ffa500] bg-clip-text text-transparent">
              Veritas CyberHub Admin
            </span>
          </div>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
            Complete content management system with bulk upload, configuration, and real-time editing.
          </p>
          <div className="text-sm text-gray-500">
            <p>Logged in as: {phone} | Role: {role}</p>
            <p className="mt-2">Total Content Items: {contentItems.length} | Last Refresh: {refreshing ? 'Refreshing...' : 'Just now'}</p>
          </div>
        </div>
      </footer>
    </div>
  );
}