import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import proxilogo from '../assets/logo.png';
import { useAuth } from '../context/AuthContext';

const LandingPage: React.FC = () => {
    const { isAuthenticated } = useAuth();
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Intersection Observer for animations
    useEffect(() => {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                }
            });
        }, { threshold: 0.1 });

        document.querySelectorAll('.fade-in').forEach(el => observer.observe(el));

        return () => observer.disconnect();
    }, []);

    return (
        <div className="bg-slate-50 text-slate-900 font-sans">
            {/* Navigation */}
            <nav className={`fixed w-full z-50 transition-all duration-300 ${scrolled ? 'bg-white/70 backdrop-blur-md shadow-sm border-b border-white/30' : 'bg-transparent'}`}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        {/* Logo */}
                        <div className="flex-shrink-0 flex items-center">
                            <span className="font-bold text-2xl text-blue-600">Proxi</span>
                        </div>
                        {/* Links */}
                        <div className="hidden md:flex space-x-8">
                            <a href="#features" className="text-slate-600 hover:text-blue-600 transition-colors">Features</a>
                            <a href="#download" className="text-slate-600 hover:text-blue-600 transition-colors">Download</a>
                            {isAuthenticated ? (
                                <Link to="/dashboard" className="text-blue-600 font-semibold hover:text-blue-700 transition-colors">Dashboard</Link>
                            ) : (
                                <Link to="/login" className="text-blue-600 font-semibold hover:text-blue-700 transition-colors">Login</Link>
                            )}
                        </div>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <header className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-[128px] opacity-20 animate-pulse"></div>
                    <div className="absolute top-20 -left-20 w-72 h-72 bg-purple-400 rounded-full mix-blend-multiply filter blur-[128px] opacity-20 animate-pulse" style={{ animationDelay: '2s' }}></div>
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
                    <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8 fade-in opacity-0 translate-y-8 transition-all duration-700">
                        Smart Proxy <br className="hidden md:block" />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Management System</span>
                    </h1>
                    <p className="text-xl md:text-2xl text-slate-600 mb-12 max-w-3xl mx-auto leading-relaxed fade-in opacity-0 translate-y-8 transition-all duration-700 delay-100">
                        Streamline school operations with intelligent substitution management, automated reporting, and real-time updates.
                    </p>
                    <div className="flex flex-col sm:flex-row justify-center gap-4 fade-in opacity-0 translate-y-8 transition-all duration-700 delay-200">
                        <a href="#download" className="px-8 py-4 bg-blue-600 text-white rounded-full font-bold shadow-lg hover:bg-blue-700 hover:shadow-blue-500/30 transition-all transform hover:-translate-y-1">
                            Download Android App
                        </a>
                        {isAuthenticated ? (
                            <Link to="/dashboard" className="px-8 py-4 bg-white text-blue-600 border border-blue-200 rounded-full font-bold shadow-sm hover:border-blue-300 hover:shadow-md transition-all">
                                Go to Dashboard
                            </Link>
                        ) : (
                            <Link to="/login" className="px-8 py-4 bg-white text-blue-600 border border-blue-200 rounded-full font-bold shadow-sm hover:border-blue-300 hover:shadow-md transition-all">
                                Web Dashboard
                            </Link>
                        )}
                    </div>
                </div>
            </header>

            {/* Features Section */}
            <section id="features" className="py-24 bg-white relative">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-20 fade-in opacity-0 translate-y-8 transition-all duration-700">
                        <h2 className="text-4xl font-bold text-slate-900 mb-4">Powerful Features</h2>
                        <p className="text-lg text-slate-600 max-w-2xl mx-auto">Everything you need to manage school substitutions effectively, all in one place.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {/* Feature 1 */}
                        <div className="group p-8 rounded-3xl bg-slate-50 border border-slate-100 hover:border-blue-100 hover:shadow-xl hover:shadow-blue-100/50 transition-all duration-500">
                            <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-blue-600/20 group-hover:scale-110 transition-transform duration-500">
                                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                            </div>
                            <h3 className="text-xl font-bold mb-3 text-slate-900">Auto-Assignment</h3>
                            <p className="text-slate-600 leading-relaxed">Intelligent algorithms automatically suggest the best available teachers for substitution based on workload and subject expertise.</p>
                        </div>

                        {/* Feature 2 */}
                        <div className="group p-8 rounded-3xl bg-slate-50 border border-slate-100 hover:border-indigo-100 hover:shadow-xl hover:shadow-indigo-100/50 transition-all duration-500 delay-100">
                            <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-indigo-600/20 group-hover:scale-110 transition-transform duration-500">
                                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path></svg>
                            </div>
                            <h3 className="text-xl font-bold mb-3 text-slate-900">Instant Reports</h3>
                            <p className="text-slate-600 leading-relaxed">Generate comprehensive monthly and weekly reports on proxies, teacher workload, and absenteeism with a single click.</p>
                        </div>

                        {/* Feature 3 */}
                        <div className="group p-8 rounded-3xl bg-slate-50 border border-slate-100 hover:border-purple-100 hover:shadow-xl hover:shadow-purple-100/50 transition-all duration-500 delay-200">
                            <div className="w-14 h-14 bg-purple-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-purple-600/20 group-hover:scale-110 transition-transform duration-500">
                                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"></path></svg>
                            </div>
                            <h3 className="text-xl font-bold mb-3 text-slate-900">Mobile App</h3>
                            <p className="text-slate-600 leading-relaxed">Dedicated Android app for teachers to manage their schedules, view assigned proxies, and get notified on the go.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Download Section */}
            <section id="download" className="py-24 bg-slate-900 text-white relative overflow-hidden">
                <div className="absolute inset-0">
                    <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900 opacity-90"></div>
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-500 rounded-full mix-blend-overlay filter blur-[128px] opacity-20"></div>
                </div>

                <div className="max-w-4xl mx-auto px-4 relative z-10 text-center">
                    <h2 className="text-4xl md:text-5xl font-bold mb-8 fade-in opacity-0 translate-y-8 transition-all duration-700">Get Proxi for Android</h2>
                    <p className="text-xl text-slate-300 mb-12 fade-in opacity-0 translate-y-8 transition-all duration-700 max-w-2xl mx-auto">
                        Experience the full power of Proxi on your mobile device. Download the APK directly and install it to get started.
                    </p>

                    <div className="p-10 rounded-[2rem] bg-white/5 backdrop-blur-xl border border-white/10 inline-block fade-in opacity-0 translate-y-8 transition-all duration-700 shadow-2xl shadow-black/20">
                        <div className="flex flex-col items-center">

                            <div className="bg-white rounded-3xl mb-6 h-32 w-32 flex items-center justify-center shadow-xl shadow-green-500/20 ring-4 ring-white/10">
                                <img src={proxilogo} alt="Proxi App Icon" className="w-24 h-24 object-contain" />
                            </div>
                            <div className="inline-flex items-center px-3 py-1 rounded-full bg-white/10 border border-white/10 text-sm font-medium text-slate-300 mb-6">
                                <span className="w-2 h-2 rounded-full bg-green-400 mr-2 animate-pulse"></span>
                                Latest Version: v1.0.0
                            </div>

                            <a href="https://github.com/metaltroop/Proxi/releases/download/v0.1/Proxi.apk" target="_blank" rel="noopener noreferrer"
                                className="group relative px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-bold hover:shadow-lg hover:shadow-green-500/30 transition-all hover:-translate-y-0.5 overflow-hidden">
                                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                                <div className="relative flex items-center gap-3">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                                    <span>Download APK</span>
                                </div>
                            </a>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-slate-50 py-10 border-t border-slate-200">
                <div className="max-w-7xl mx-auto px-4 text-center text-slate-500">
                    <p>&copy; 2026 Proxi. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;
