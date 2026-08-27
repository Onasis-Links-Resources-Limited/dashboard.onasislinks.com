import { useState, useEffect, useRef } from 'react';
import { AVATARS } from '../data/avatar';
import { Eye, EyeOff, ChevronDown, ChevronUp, Check, Upload, Camera, User as UserIcon } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const ProfileModal = ({ isOpen, onClose }) => {
  const { user, updateGlobalUser } = useAuth();
  const [selectedAvatar, setSelectedAvatar] = useState(null);
  const [isUpdatingAvatar, setIsUpdatingAvatar] = useState(false);
  const fileInputRef = useRef(null);
  const { theme } = useTheme();
  const isDark = theme === "dark";
  
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ first_name: '', last_name: '', phone: '' });
  
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [passData, setPassData] = useState({ current_password: '', new_password: '' });
  const [isChangingPass, setIsChangingPass] = useState(false);
  const [passMessage, setPassMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    if (isOpen && user) {
      let avatarId = user.avatar_url || localStorage.getItem(`avatar_${user.id}`);
      if (avatarId && !AVATARS.find(a => a.id === avatarId)) avatarId = null;
      
      setSelectedAvatar(avatarId || null);
      setFormData({ 
        first_name: user.first_name || '', 
        last_name: user.last_name || '',
        phone: user.phone || ''
      });
      setShowPasswordChange(false);
      setPassMessage({ type: '', text: '' });
      setPassData({ current_password: '', new_password: '' });
    }
  }, [isOpen, user]);

  const handleAvatarSelect = async (avatarId) => {
    if (isUpdatingAvatar) return;
    setSelectedAvatar(avatarId);
    setIsUpdatingAvatar(true);
    localStorage.setItem(`avatar_${user.id}`, avatarId);
    setIsUpdatingAvatar(false);
  };

  const handleProfileUpdate = async () => {
    if (!formData.first_name.trim()) return;
    setIsEditing(false);
    const token = localStorage.getItem('token');
    const response = await api.auth.updateProfile(token, formData);
    if (response.success) {
      updateGlobalUser(response.data);
    } else {
      alert('Failed: ' + response.message);
      setIsEditing(true);
    }
  };

  const handleChangePassword = async () => {
    if (!passData.current_password || !passData.new_password || passData.new_password.length < 6) {
      setPassMessage({ type: 'error', text: 'Please fill both fields correctly.' });
      return;
    }
    setIsChangingPass(true);
    setPassMessage({ type: '', text: '' });
    try {
      const token = localStorage.getItem('token'); 
      const data = await api.auth.changePassword(token, passData.current_password, passData.new_password);
      if (data.success) {
        setPassMessage({ type: 'success', text: 'Password changed successfully!' });
        setPassData({ current_password: '', new_password: '' });
        setShowPasswordChange(false);
      } else {
        setPassMessage({ type: 'error', text: data.errors ? data.errors[0] : data.message });
      }
    } catch (error) {
      setPassMessage({ type: 'error', text: 'Network error.' });
    } finally {
      setIsChangingPass(false);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('avatar', file);
    const token = localStorage.getItem('token');
    const response = await api.auth.uploadAvatar(token, formData);
    if (response.success) {
      updateGlobalUser({ avatar_url: response.data.avatar_url });
      setSelectedAvatar(null); 
      localStorage.removeItem(`avatar_${user.id}`);
    } else {
      alert('Upload failed: ' + response.message);
    }
  };

  const renderProfileImage = () => {
    if (user?.avatar_url) return <img src={user.avatar_url} alt="Avatar" className="w-full h-full object-cover" />;
    if (selectedAvatar) {
      const avatar = AVATARS.find(a => a.id === selectedAvatar);
      return avatar ? <img src={avatar.src} alt={avatar.name} className="w-full h-full object-cover" /> : null;
    }
    return (
      <div className="w-full h-full bg-gradient-to-r from-[#C3110C] to-[#E6501B] flex items-center justify-center text-white font-bold text-2xl">
        {user?.first_name?.charAt(0) || 'A'}
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[9999] p-4 backdrop-blur-md">
      <div className={`border rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col ${isDark ? "bg-[#1A1A1A] border-[#2A2A2A]" : "bg-white border-gray-200"}`}>
        
        {/* --- HEADER: Centered Avatar & Name --- */}
        <div className={`p-8 pb-4 flex flex-col items-center border-b relative ${isDark ? "border-[#2A2A2A]" : "border-gray-200"}`}>
          <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-[#E6501B] shadow-[0_0_20px_rgba(195,17,12,0.2)] mb-3 relative group">
            {renderProfileImage()}
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer" onClick={() => fileInputRef.current?.click()}>
              <Camera className="w-6 h-6 text-white" />
            </div>
          </div>
          <h2 className={`text-xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>{user?.first_name} {user?.last_name}</h2>
          <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}>{user?.email}</p>
          <span className="mt-1 px-3 py-0.5 bg-[#C3110C]/10 text-[#C3110C] text-xs font-bold rounded-full uppercase tracking-wider">
            {user?.role || 'Staff'}
          </span>
          
          <button onClick={onClose} className={`absolute top-4 right-4 transition-colors ${isDark ? "text-gray-500 hover:text-white" : "text-gray-400 hover:text-gray-900"}`}>
            ✕
          </button>
        </div>

        {/* --- SCROLLABLE CONTENT --- */}
        <div className="p-6 max-h-[60vh] overflow-y-auto custom-scrollbar">
          
          {/* 1. AVATAR SELECTION */}
          <div className={`mb-6 rounded-xl p-4 ${isDark ? "bg-[#242424]" : "bg-gray-50"}`}>
            <div className="flex items-center justify-between mb-2">
              <p className={`text-sm font-medium ${isDark ? "text-gray-300" : "text-gray-700"}`}>Choose Style</p>
              {isUpdatingAvatar && <span className="text-xs text-blue-400 animate-pulse">Saving...</span>}
            </div>
            <div className="grid grid-cols-6 gap-2">
              {AVATARS.map((avatar) => (
                <button
                  key={avatar.id}
                  onClick={() => handleAvatarSelect(avatar.id)}
                  className={`relative w-full aspect-square rounded-full overflow-hidden border-2 transition-all ${
                    selectedAvatar === avatar.id 
                      ? 'border-[#C3110C] ring-2 ring-[#C3110C]/20' 
                      : isDark ? 'border-transparent hover:border-[#4A4A4A]' : 'border-transparent hover:border-gray-300'
                  }`}
                >
                  <img src={avatar.src} alt={avatar.name} className="w-full h-full object-cover" />
                  {selectedAvatar === avatar.id && (
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-[#C3110C] rounded-full flex items-center justify-center text-white text-[10px] shadow-lg">
                      <Check className="w-3 h-3" />
                    </div>
                  )}
                </button>
              ))}
            </div>
            
            {/* Upload Button */}
            <button 
              onClick={() => fileInputRef.current?.click()}
              className={`w-full mt-3 flex items-center justify-center gap-2 border border-dashed rounded-lg py-2 text-xs transition-colors ${isDark ? "border-[#3A3A3A] text-gray-400 hover:text-white hover:border-[#C3110C]" : "border-gray-300 text-gray-600 hover:text-gray-900 hover:border-[#C3110C]"}`}
            >
              <Upload className="w-3 h-3" />
              Upload Custom Image
            </button>
            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileUpload} />
          </div>

          {/* 2. DETAILS */}
          <div className="space-y-3">
            <div className={`rounded-xl p-4 flex justify-between items-center ${isDark ? "bg-[#242424]" : "bg-gray-50"}`}>
              <div>
                <p className={`text-xs uppercase tracking-wide mb-0.5 ${isDark ? "text-gray-500" : "text-gray-500"}`}>Full Name</p>
                {isEditing ? (
                  <div className="flex gap-2">
                    <input type="text" value={formData.first_name} onChange={(e) => setFormData({...formData, first_name: e.target.value})} className={`w-20 rounded px-2 py-1 text-sm ${isDark ? "bg-[#1A1A1A] border border-[#3A3A3A] text-gray-200" : "bg-white border border-gray-300 text-gray-900"}`} />
                    <input type="text" value={formData.last_name} onChange={(e) => setFormData({...formData, last_name: e.target.value})} className={`w-20 rounded px-2 py-1 text-sm ${isDark ? "bg-[#1A1A1A] border border-[#3A3A3A] text-gray-200" : "bg-white border border-gray-300 text-gray-900"}`} />
                  </div>
                ) : (
                  <p className={`text-sm font-medium ${isDark ? "text-white" : "text-gray-900"}`}>{user?.first_name} {user?.last_name}</p>
                )}
              </div>
              {!isEditing ? (
                <button onClick={() => setIsEditing(true)} className="text-xs text-[#C3110C] hover:text-[#E6501B] font-medium">Edit</button>
              ) : (
                <div className="flex gap-2">
                  <button onClick={handleProfileUpdate} className="text-xs text-green-400 hover:text-green-300 font-medium">Save</button>
                  <button onClick={() => setIsEditing(false)} className={`text-xs font-medium ${isDark ? "text-gray-400 hover:text-gray-300" : "text-gray-600 hover:text-gray-500"}`}>Cancel</button>
                </div>
              )}
            </div>

            {/* Password Dropdown */}
            <div className={`rounded-xl overflow-hidden ${isDark ? "bg-[#242424]" : "bg-gray-50"}`}>
              <button onClick={() => setShowPasswordChange(!showPasswordChange)} className={`w-full p-4 flex items-center justify-between text-sm transition-colors ${isDark ? "text-gray-300 hover:bg-[#2A2A2A]" : "text-gray-700 hover:bg-gray-100"}`}>
                <span className="font-medium">Security</span>
                {showPasswordChange ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
              {showPasswordChange && (
                <div className={`p-4 border-t space-y-3 ${isDark ? "border-[#2A2A2A]" : "border-gray-200"}`}>
                  <div className="relative">
                    <input type={showCurrentPass ? "text" : "password"} value={passData.current_password} onChange={(e) => setPassData({...passData, current_password: e.target.value})} className={`w-full rounded px-3 py-2 text-sm focus:outline-none focus:border-[#C3110C] ${isDark ? "bg-[#1A1A1A] border border-[#3A3A3A] text-gray-200" : "bg-white border border-gray-300 text-gray-900"}`} placeholder="Current Password" />
                    <button onClick={() => setShowCurrentPass(!showCurrentPass)} className={`absolute right-2 top-2.5 ${isDark ? "text-gray-500 hover:text-gray-300" : "text-gray-400 hover:text-gray-600"}`}>{showCurrentPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button>
                  </div>
                  <div className="relative">
                    <input type={showNewPass ? "text" : "password"} value={passData.new_password} onChange={(e) => setPassData({...passData, new_password: e.target.value})} className={`w-full rounded px-3 py-2 text-sm focus:outline-none focus:border-[#C3110C] ${isDark ? "bg-[#1A1A1A] border border-[#3A3A3A] text-gray-200" : "bg-white border border-gray-300 text-gray-900"}`} placeholder="New Password" />
                    <button onClick={() => setShowNewPass(!showNewPass)} className={`absolute right-2 top-2.5 ${isDark ? "text-gray-500 hover:text-gray-300" : "text-gray-400 hover:text-gray-600"}`}>{showNewPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button>
                  </div>
                  <button onClick={handleChangePassword} disabled={isChangingPass} className="w-full py-2 bg-[#C3110C] hover:bg-[#E6501B] text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50">{isChangingPass ? 'Updating...' : 'Update Password'}</button>
                  {passMessage.text && <div className={`text-xs ${passMessage.type === 'error' ? 'text-red-400' : 'text-green-400'}`}>{passMessage.text}</div>}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileModal;