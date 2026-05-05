import React, { useState, useRef } from 'react';
import MainLayout from '@/Layouts/MainLayout';
import { Head, useForm, usePage } from '@inertiajs/react';
import { Camera, Save, KeyRound, User, Mail, ShieldAlert } from 'lucide-react';

export default function Edit({ mustVerifyEmail, status }) {
    const user = usePage().props.auth.user;
    const avatarInput = useRef();

    const { data, setData, put, errors, processing, recentlySuccessful } = useForm({
        name: user.name,
        email: user.email,
    });

    const {
        data: passwordData,
        setData: setPasswordData,
        put: putPassword,
        errors: passwordErrors,
        processing: passwordProcessing,
        recentlySuccessful: passwordSuccessful,
        reset: resetPassword,
    } = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    const {
        data: avatarData,
        setData: setAvatarData,
        post: postAvatar,
        errors: avatarErrors,
        processing: avatarProcessing,
    } = useForm({
        avatar: null,
    });

    const [avatarPreview, setAvatarPreview] = useState(user.avatar_url || null);

    const submitProfile = (e) => {
        e.preventDefault();
        put('/settings/profile');
    };

    const submitPassword = (e) => {
        e.preventDefault();
        putPassword('/settings/password', {
            preserveScroll: true,
            onSuccess: () => resetPassword(),
        });
    };

    const handleAvatarChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setAvatarData('avatar', file);
            setAvatarPreview(URL.createObjectURL(file));
            postAvatar('/settings/avatar', {
                preserveScroll: true,
            });
        }
    };

    return (
        <>
            <Head title="Settings" />

            <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-10">
                
                {/* Header */}
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">Account Settings</h1>
                    <p className="text-gray-400">Manage your profile, avatar, and security preferences.</p>
                </div>

                {status && (
                    <div className="bg-green-500/10 border border-green-500/50 text-green-400 px-4 py-3 rounded-lg flex items-center">
                        {status}
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    
                    {/* Left Column: Avatar & Quick Info */}
                    <div className="md:col-span-1 space-y-6">
                        <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700/50 flex flex-col items-center text-center">
                            <div className="relative group mb-4">
                                <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-gray-700 relative bg-gray-700">
                                    {avatarPreview ? (
                                        <img src={avatarPreview} alt={user.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <User className="w-full h-full p-6 text-gray-500" />
                                    )}
                                </div>
                                <button 
                                    onClick={() => avatarInput.current.click()}
                                    className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-full cursor-pointer"
                                >
                                    <Camera className="w-8 h-8 text-white" />
                                </button>
                                <input 
                                    type="file" 
                                    ref={avatarInput} 
                                    className="hidden" 
                                    accept="image/*"
                                    onChange={handleAvatarChange}
                                />
                            </div>
                            <h3 className="text-xl font-bold text-white">{user.name}</h3>
                            <p className="text-gray-400 text-sm mb-4">{user.email}</p>
                            
                            <div className="w-full bg-gray-900/50 rounded-lg p-3 text-sm text-left">
                                <p className="text-gray-400 flex justify-between">
                                    <span>Plan:</span>
                                    <span className="text-white font-medium">Premium</span>
                                </p>
                                <p className="text-gray-400 flex justify-between mt-2">
                                    <span>Member since:</span>
                                    <span className="text-white font-medium">{new Date(user.created_at).toLocaleDateString()}</span>
                                </p>
                            </div>
                            {avatarErrors.avatar && (
                                <p className="text-red-400 text-xs mt-2">{avatarErrors.avatar}</p>
                            )}
                        </div>
                    </div>

                    {/* Right Column: Forms */}
                    <div className="md:col-span-2 space-y-8">
                        
                        {/* Profile Info Form */}
                        <section className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700/50">
                            <h2 className="text-xl font-bold text-white flex items-center gap-2 mb-6">
                                <User className="w-5 h-5 text-indigo-400" />
                                Profile Information
                            </h2>
                            <form onSubmit={submitProfile} className="space-y-4">
                                <div>
                                    <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1">Name</label>
                                    <input
                                        id="name"
                                        type="text"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                                    />
                                    {errors.name && <p className="text-red-400 text-sm mt-1">{errors.name}</p>}
                                </div>

                                <div>
                                    <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">Email</label>
                                    <input
                                        id="email"
                                        type="email"
                                        value={data.email}
                                        onChange={(e) => setData('email', e.target.value)}
                                        className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                                    />
                                    {errors.email && <p className="text-red-400 text-sm mt-1">{errors.email}</p>}
                                </div>

                                <div className="flex items-center gap-4 pt-2">
                                    <button
                                        disabled={processing}
                                        className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-6 rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
                                    >
                                        <Save className="w-4 h-4" />
                                        Save Profile
                                    </button>
                                    {recentlySuccessful && <span className="text-green-400 text-sm">Saved.</span>}
                                </div>
                            </form>
                        </section>

                        {/* Password Form */}
                        <section className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700/50">
                            <h2 className="text-xl font-bold text-white flex items-center gap-2 mb-6">
                                <KeyRound className="w-5 h-5 text-purple-400" />
                                Update Password
                            </h2>
                            <form onSubmit={submitPassword} className="space-y-4">
                                <div>
                                    <label htmlFor="current_password" className="block text-sm font-medium text-gray-300 mb-1">Current Password</label>
                                    <input
                                        id="current_password"
                                        type="password"
                                        value={passwordData.current_password}
                                        onChange={(e) => setPasswordData('current_password', e.target.value)}
                                        className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                                    />
                                    {passwordErrors.current_password && <p className="text-red-400 text-sm mt-1">{passwordErrors.current_password}</p>}
                                </div>

                                <div>
                                    <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-1">New Password</label>
                                    <input
                                        id="password"
                                        type="password"
                                        value={passwordData.password}
                                        onChange={(e) => setPasswordData('password', e.target.value)}
                                        className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                                    />
                                    {passwordErrors.password && <p className="text-red-400 text-sm mt-1">{passwordErrors.password}</p>}
                                </div>

                                <div>
                                    <label htmlFor="password_confirmation" className="block text-sm font-medium text-gray-300 mb-1">Confirm New Password</label>
                                    <input
                                        id="password_confirmation"
                                        type="password"
                                        value={passwordData.password_confirmation}
                                        onChange={(e) => setPasswordData('password_confirmation', e.target.value)}
                                        className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                                    />
                                    {passwordErrors.password_confirmation && <p className="text-red-400 text-sm mt-1">{passwordErrors.password_confirmation}</p>}
                                </div>

                                <div className="flex items-center gap-4 pt-2">
                                    <button
                                        disabled={passwordProcessing}
                                        className="bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-6 rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
                                    >
                                        <Save className="w-4 h-4" />
                                        Save Password
                                    </button>
                                    {passwordSuccessful && <span className="text-green-400 text-sm">Saved.</span>}
                                </div>
                            </form>
                        </section>

                    </div>
                </div>
            </div>
        </>
    );
}

Edit.layout = page => <MainLayout children={page} />;
