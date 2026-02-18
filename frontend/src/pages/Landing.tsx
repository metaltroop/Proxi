import { useEffect } from 'react';
import { Link } from 'react-router-dom';

const Landing = () => {
    useEffect(() => {
        // Navbar Scrolled State
        const handleScroll = () => {
            const nav = document.getElementById('navbar');
            if (nav) {
                if (window.scrollY > 20) {
                    nav.classList.add('glass', 'shadow-sm');
                    nav.classList.remove('bg-transparent');
                } else {
                    nav.classList.remove('glass', 'shadow-sm');
                    nav.classList.add('bg-transparent');
                }
            }
        };

        window.addEventListener('scroll', handleScroll);

        // Intersection Observer for Fade-in Animation
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                }
            });
        }, { threshold: 0.1 });

        document.querySelectorAll('.fade-in').forEach(el => observer.observe(el));

        return () => {
            window.removeEventListener('scroll', handleScroll);
            observer.disconnect();
        };
    }, []);

    return (
        <div className="bg-slate-50 text-slate-900 font-sans">
            <style>{`
                .fade-in {
                    opacity: 0;
                    transform: translateY(20px);
                    transition: opacity 0.8s ease-out, transform 0.8s ease-out;
                }
                .fade-in.visible {
                    opacity: 1;
                    transform: translateY(0);
                }
                .glass {
                    background: rgba(255, 255, 255, 0.7);
                    backdrop-filter: blur(10px);
                    border: 1px solid rgba(255, 255, 255, 0.3);
                }
                .animate-blob {
                    animation: blob 7s infinite;
                }
                .animation-delay-2000 {
                    animation-delay: 2s;
                }
                @keyframes blob {
                    0% { transform: translate(0px, 0px) scale(1); }
                    33% { transform: translate(30px, -50px) scale(1.1); }
                    66% { transform: translate(-20px, 20px) scale(0.9); }
                    100% { transform: translate(0px, 0px) scale(1); }
                }
            `}</style>

            {/* Navigation */}
            <nav className="fixed w-full z-50 transition-all duration-300 bg-transparent" id="navbar">
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
                            <Link to="/login" className="text-blue-600 font-semibold hover:text-blue-700 transition-colors">Login</Link>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <header className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
                    <div className="absolute top-20 -left-20 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
                    <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 fade-in">
                        Smart Proxy <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Management</span>
                    </h1>
                    <p className="text-xl md:text-2xl text-slate-600 mb-10 max-w-3xl mx-auto fade-in" style={{ transitionDelay: '100ms' }}>
                        Streamline school operations with intelligent substitution management, automated reporting, and real-time updates.
                    </p>
                    <div className="flex flex-col sm:flex-row justify-center gap-4 fade-in" style={{ transitionDelay: '200ms' }}>
                        <a href="https://github.com/metaltroop/Proxi/releases/download/v0.1/Proxi.apk" className="px-8 py-4 bg-blue-600 text-white rounded-full font-semibold shadow-lg hover:bg-blue-700 hover:shadow-xl transition-all transform hover:-translate-y-1">
                            Download Android App
                        </a>
                        <Link to="/login" className="px-8 py-4 bg-white text-blue-600 border border-blue-200 rounded-full font-semibold shadow-sm hover:border-blue-300 hover:shadow-md transition-all">
                            Web Dashboard
                        </Link>
                    </div>
                </div>
            </header>

            {/* Features Section */}
            <section id="features" className="py-20 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16 fade-in">
                        <h2 className="text-3xl font-bold text-slate-900">Powerful Modules</h2>
                        <p className="mt-4 text-slate-600">Everything you need to manage school substitutions effectively.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {/* Feature 1 */}
                        <div className="p-8 rounded-2xl bg-slate-50 border border-slate-100 hover:shadow-lg transition-shadow fade-in">
                            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-6">
                                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold mb-3">Auto-Assignment</h3>
                            <p className="text-slate-600">Intelligent algorithms automatically suggest the best available teachers for substitution based on workload and subject expertise.</p>
                        </div>

                        {/* Feature 2 */}
                        <div className="p-8 rounded-2xl bg-slate-50 border border-slate-100 hover:shadow-lg transition-shadow fade-in" style={{ transitionDelay: '100ms' }}>
                            <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center mb-6">
                                <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path>
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold mb-3">Instant Reports</h3>
                            <p className="text-slate-600">Generate comprehensive monthly and weekly reports on proxies, teacher workload, and absenteeism with a single click.</p>
                        </div>

                        {/* Feature 3 */}
                        <div className="p-8 rounded-2xl bg-slate-50 border border-slate-100 hover:shadow-lg transition-shadow fade-in" style={{ transitionDelay: '200ms' }}>
                            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-6">
                                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"></path>
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold mb-3">Mobile App</h3>
                            <p className="text-slate-600">Teachers created specifically for Android to manage their schedules and view assigned proxies on the go.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Download Section */}
            <section id="download" className="py-20 bg-slate-900 text-white relative overflow-hidden">
                <div className="absolute inset-0">
                    <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-slate-900 to-blue-900 opacity-90"></div>
                </div>

                <div className="max-w-4xl mx-auto px-4 relative z-10 text-center">
                    <h2 className="text-3xl md:text-4xl font-bold mb-8 fade-in">Get Proxi for Android</h2>
                    <p className="text-lg text-slate-300 mb-10 fade-in">Experience the full power of Proxi on your mobile device. Download the APK directly and install it to get started.</p>

                    <div className="p-8 rounded-3xl bg-white/10 backdrop-blur-md border border-white/20 inline-block fade-in">
                        <div className="flex flex-col items-center">
                            <svg className="w-16 h-16 text-green-400 mb-4" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M17.523 15.3414C17.523 15.3414 17.5605 15.3414 17.5982 15.304C18.2368 14.6322 18.2368 13.548 17.5982 12.9126L15.304 10.5891C14.6654 9.95368 13.6133 9.95368 12.9748 10.5891C12.3736 11.2246 12.336 12.1966 12.8622 12.8378L14.7032 14.6676L3.99648 14.6676C3.09405 14.6676 2.38086 15.4151 2.38086 16.3129C2.38086 17.2106 3.09405 17.9582 3.99648 17.9582L14.7032 17.9582L12.8622 19.788C12.336 20.4292 12.3736 21.4012 12.9748 22.0366C13.6133 22.6721 14.6654 22.6721 15.304 22.0366L17.5982 19.7131C18.2368 19.0776 18.2368 17.9934 17.5982 17.3216C17.5605 17.2842 17.523 17.2842 17.523 17.2842L15.4168 15.1544L17.523 15.3414ZM12.0001 2.91577L12.0001 6.2063C12.0001 7.10403 12.7133 7.8516 13.6158 7.8516C14.5182 7.8516 15.2314 7.10403 15.2314 6.2063L15.2314 2.91577C15.2314 2.01804 14.5182 1.27051 13.6158 1.27051C12.7133 1.27051 12.0001 2.01804 12.0001 2.91577Z" />
                            </svg>
                            <span className="text-sm text-slate-400 mb-2">Latest Version: v1.0.0</span>

                            <a href="https://github.com/metaltroop/Proxi/releases/download/v0.1/Proxi.apk" id="download-link" className="px-8 py-3 bg-green-500 text-white rounded-lg font-bold hover:bg-green-600 transition-colors flex items-center gap-2">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
                                </svg>
                                Download APK
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

export default Landing;
