import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar.jsx";
import {
  Eye, FileText, Search, BarChart3, Bell, History, CheckCircle, Users, Building2,
  AlertCircle, ArrowRight, Shield, Zap, Globe, Mail, Phone, MapPin, Twitter, Facebook, Linkedin, Github
} from "lucide-react";

function useCounter(target, duration = 2000) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        let start = 0;
        const step = target / (duration / 16);
        const timer = setInterval(() => {
          start += step;
          if (start >= target) { setCount(target); clearInterval(timer); }
          else setCount(Math.floor(start));
        }, 16);
        observer.disconnect();
      }
    });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target, duration]);
  return [count, ref];
}

const features = [
  { icon: FileText, title: "Complaint Registration", desc: "Easily register civic complaints with photos, location and priority levels.", color: "bg-blue-500" },
  { icon: Search, title: "Real-Time Tracking", desc: "Track your complaint status in real-time using your unique tracking ID.", color: "bg-emerald-500" },
  { icon: BarChart3, title: "Government Dashboard", desc: "Powerful admin tools for government officials to manage and resolve complaints.", color: "bg-purple-500" },
  { icon: BarChart3, title: "Complaint Analytics", desc: "Visual reports and insights on complaint trends and department performance.", color: "bg-orange-500" },
  { icon: Bell, title: "Notifications", desc: "Instant notifications on status updates, remarks and resolutions.", color: "bg-pink-500" },
  { icon: History, title: "Complaint History", desc: "Complete timeline of every complaint with full audit trail.", color: "bg-cyan-500" },
];

const stats = [
  { label: "Total Complaints", target: 12847, suffix: "+", color: "text-blue-600" },
  { label: "Resolved Complaints", target: 9832, suffix: "+", color: "text-emerald-600" },
  { label: "Active Users", target: 34500, suffix: "+", color: "text-purple-600" },
  { label: "Government Departments", target: 28, suffix: "", color: "text-orange-600" },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <section className="pt-16 gradient-blue min-h-screen flex items-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-white rounded-full blur-3xl" />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-24 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm border border-white/30 rounded-full px-4 py-2 text-white text-sm font-medium mb-8">
            <Shield className="w-4 h-4" />
            Trusted by 34,500+ Citizens
          </div>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
            Smart Civic Complaint
            <br />
            <span className="text-cyan-300">Management System</span>
          </h1>
          <p className="text-lg md:text-xl text-blue-100 mb-10 max-w-3xl mx-auto leading-relaxed">
            CivicEye empowers citizens to report public issues and helps government authorities manage and resolve complaints efficiently — building better communities together.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register" className="inline-flex items-center gap-2 bg-white text-blue-700 font-bold px-8 py-4 rounded-xl hover:bg-blue-50 transition-all duration-200 shadow-xl hover:shadow-2xl text-lg">
              <FileText className="w-5 h-5" />
              Register Complaint
            </Link>
            <Link to="/track-complaint" className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm border border-white/40 text-white font-bold px-8 py-4 rounded-xl hover:bg-white/30 transition-all duration-200 text-lg">
              <Search className="w-5 h-5" />
              Track Complaint
            </Link>
          </div>
        </div>
      </section>

      <section id="features" className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-600 rounded-full px-4 py-2 text-sm font-semibold mb-4">
              <Zap className="w-4 h-4" />
              Platform Features
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Everything you need to resolve civic issues</h2>
            <p className="text-gray-500 text-lg max-w-2xl mx-auto">Powerful tools for citizens and government officials to work together for better cities.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map(({ icon: Icon, title, desc, color }) => (
              <div key={title} className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group">
                <div className={`w-12 h-12 rounded-xl ${color} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{title}</h3>
                <p className="text-gray-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Impact by the numbers</h2>
            <p className="text-gray-500 text-lg">Real data reflecting our platform's impact on civic engagement.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map(({ label, target, suffix, color }) => {
              const [count, ref] = useCounter(target);
              return (
                <div key={label} ref={ref} className="text-center p-8 rounded-2xl gradient-card border border-blue-100 hover:shadow-lg transition-all duration-300">
                  <div className={`text-4xl font-bold ${color} mb-2`}>
                    {count.toLocaleString()}{suffix}
                  </div>
                  <div className="text-gray-600 font-medium">{label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section id="about" className="py-24 bg-blue-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-white/20 text-white rounded-full px-4 py-2 text-sm font-semibold mb-6">
                <Globe className="w-4 h-4" />
                About CivicEye
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-6 leading-tight">
                Bridging citizens and government for better cities
              </h2>
              <p className="text-blue-100 text-lg leading-relaxed mb-8">
                CivicEye is a smart complaint management platform that makes it easy for citizens to report public issues and for government departments to track, manage, and resolve them efficiently.
              </p>
              <div className="space-y-4">
                {["Transparent complaint tracking with real-time updates", "Efficient department-wise complaint routing", "Analytics-driven decision making for officials", "Secure and privacy-focused platform"].map((item) => (
                  <div key={item} className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-cyan-300 mt-0.5 shrink-0" />
                    <span className="text-blue-100">{item}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { icon: Users, label: "Active Citizens", value: "34,500+" },
                { icon: Building2, label: "Departments", value: "28" },
                { icon: CheckCircle, label: "Resolved", value: "9,832" },
                { icon: AlertCircle, label: "In Progress", value: "1,240" },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 text-center hover:bg-white/20 transition-all">
                  <Icon className="w-8 h-8 text-cyan-300 mx-auto mb-3" />
                  <div className="text-2xl font-bold text-white mb-1">{value}</div>
                  <div className="text-blue-200 text-sm">{label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="contact" className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Get in Touch</h2>
            <p className="text-gray-500 text-lg">Have a question or need support? We're here to help.</p>
          </div>
          <div className="grid lg:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              { icon: Mail, title: "Email Us", value: "support@civiceye.gov.in", color: "bg-blue-500" },
              { icon: Phone, title: "Call Us", value: "+91 1800-123-4567", color: "bg-emerald-500" },
              { icon: MapPin, title: "Visit Us", value: "Civic Center, New Delhi, India", color: "bg-purple-500" },
            ].map(({ icon: Icon, title, value, color }) => (
              <div key={title} className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 text-center hover:shadow-lg transition-all duration-300">
                <div className={`w-12 h-12 ${color} rounded-xl flex items-center justify-center mx-auto mb-4`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">{title}</h3>
                <p className="text-gray-500 text-sm">{value}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="bg-slate-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                  <Eye className="w-4 h-4 text-white" />
                </div>
                <span className="font-bold text-xl">CivicEye</span>
              </div>
              <p className="text-slate-400 text-sm leading-relaxed">Smart civic complaint management for a better tomorrow.</p>
              <div className="flex gap-3 mt-4">
                {[Twitter, Facebook, Linkedin, Github].map((Icon, i) => (
                  <a key={i} href="#" className="w-8 h-8 bg-slate-800 hover:bg-blue-600 rounded-lg flex items-center justify-center transition-colors">
                    <Icon className="w-4 h-4" />
                  </a>
                ))}
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-slate-200">Quick Links</h4>
              <ul className="space-y-2">
                {[["Home", "/"], ["Login", "/login"], ["Register", "/register"], ["Track Complaint", "/track-complaint"]].map(([label, to]) => (
                  <li key={label}><Link to={to} className="text-slate-400 hover:text-blue-400 text-sm transition-colors">{label}</Link></li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-slate-200">Contact</h4>
              <ul className="space-y-2 text-slate-400 text-sm">
                <li>support@civiceye.gov.in</li>
                <li>+91 1800-123-4567</li>
                <li>New Delhi, India</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-800 pt-6 text-center text-slate-500 text-sm">
            © 2024 CivicEye. All rights reserved. Built for better governance.
          </div>
        </div>
      </footer>
    </div>
  );
}
