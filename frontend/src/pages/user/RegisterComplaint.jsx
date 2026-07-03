import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import {
  createComplaint,
  clearSuccess,
  clearError,
} from "../../store/slices/complaintSlice.js";

import UserLayout from "../../layouts/UserLayout.jsx";
import CameraCapture from "../../components/CameraCapture.jsx";

import {
  Upload,
  X,
  CheckCircle,
  AlertCircle,
  RotateCcw,
  MapPin,
  Camera,
} from "lucide-react";

const CATEGORIES = ["Road", "Electricity", "Water", "Sanitation", "Traffic", "Other"];
const PRIORITIES = ["Low", "Medium", "High", "Urgent"];

export default function RegisterComplaint() {
  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "",
    priority: "",
    address: "",
  });

  const [preview, setPreview] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [showCameraModal, setShowCameraModal] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { loading, error, success } = useSelector((s) => s.complaints);

  useEffect(() => {
    dispatch(clearSuccess());
    dispatch(clearError());
  }, [dispatch]);

  useEffect(() => {
    if (success) {
      const t = setTimeout(() => {
        dispatch(clearSuccess());
        navigate("/my-complaints");
      }, 2000);
      return () => clearTimeout(t);
    }
  }, [success, dispatch, navigate]);

  // Gallery File handler
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setSelectedImage(file); // Stores raw binary File object directly
    setPreview(URL.createObjectURL(file)); // Local browser path mapping for UI
  };

  // 🚨 CRITICAL FRONTEND FIX: Camera Blob to Standard File Object Converter
  const handleCameraImageCaptured = (incomingFileOrBlob) => {
    if (!incomingFileOrBlob) return;

    let finalFile = incomingFileOrBlob;

    // Check agar incoming stream pure Blob hai (bina name aur extension property ke)
    if (incomingFileOrBlob instanceof Blob && !(incomingFileOrBlob instanceof File)) {
      console.log("[CIVIC-EYE] Converting pure camera blob into standard multi-part File structural object.");
      finalFile = new File([incomingFileOrBlob], `camera-capture-${Date.now()}.jpg`, {
        type: incomingFileOrBlob.type || "image/jpeg",
      });
    }

    setSelectedImage(finalFile); // Ab selectedImage mein strictly readable File metadata hi save hoga!
    setPreview(URL.createObjectURL(finalFile)); // Dynamic UI rendering path map setup
    setShowCameraModal(false);
  };

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }

    setLoadingLocation(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const lat = position.coords.latitude;
          const lon = position.coords.longitude;

          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`
          );

          const data = await response.json();

          setForm((prev) => ({
            ...prev,
            address: data.display_name || `${lat}, ${lon}`,
          }));
        } catch (error) {
          console.log(error);
          alert("Failed to reverse geocode structural coordinates into address");
        } finally {
          setLoadingLocation(false);
        }
      },
      (error) => {
        console.log(error);
        alert("Location tracking permission denied");
        setLoadingLocation(false);
      }
    );
  };

  const handleReset = () => {
    setForm({
      title: "",
      description: "",
      category: "",
      priority: "",
      address: "",
    });
    setPreview(null);
    setSelectedImage(null);
    dispatch(clearError());
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("title", form.title.trim());
    formData.append("description", form.description.trim());
    formData.append("category", form.category);
    formData.append("address", form.address.trim());
    
    if (form.priority) {
      formData.append("priority", form.priority);
    }

    // MULTIPART DATA SYNC: Safe validated file stream directly mapped inside multi-part key data
    if (selectedImage) {
      console.log("[CIVIC-EYE SUBMIT DATA Check Object]:", selectedImage);
      formData.append("image", selectedImage); 
    }

    dispatch(createComplaint(formData));
  };

  return (
    <UserLayout>
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Register Complaint</h1>
          <p className="text-gray-500 mt-1">
            Fill in the details below to submit your civic complaint
          </p>
        </div>

        {success && (
          <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-200 rounded-xl p-4 mb-6">
            <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0" />
            <div>
              <p className="text-emerald-800 font-semibold">Complaint submitted successfully!</p>
              <p className="text-emerald-600 text-sm">Redirecting to your complaints dashboard...</p>
            </div>
          </div>
        )}

        {error && (
          <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
            <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 space-y-6">
          {/* TITLE */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Complaint Title *</label>
            <input
              type="text"
              required
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-blue-500 transition-all text-sm"
              placeholder="Brief title for your complaint"
            />
          </div>

          {/* DESCRIPTION */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Description *</label>
            <textarea
              required
              rows={4}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-blue-500 transition-all text-sm resize-none"
              placeholder="Describe the issue in detail..."
            />
          </div>

          {/* CATEGORY + PRIORITY */}
          <div className="grid sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Category *</label>
              <select
                required
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white focus:outline-none focus:border-blue-500 transition-all text-sm"
              >
                <option value="">Select category</option>
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Priority</label>
              <select
                value={form.priority}
                onChange={(e) => setForm({ ...form, priority: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white focus:outline-none focus:border-blue-500 transition-all text-sm"
              >
                <option value="">Auto Detect Priority</option>
                {PRIORITIES.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
          </div>

          {/* LOCATION */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-semibold text-gray-700">Address / Location *</label>
              <button
                type="button"
                onClick={getCurrentLocation}
                className="flex items-center gap-1 text-sm text-blue-600 font-medium hover:text-blue-700"
              >
                <MapPin className="w-4 h-4" />
                {loadingLocation ? "Detecting..." : "Use Current Location"}
              </button>
            </div>
            <input
              type="text"
              required
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-blue-500 transition-all text-sm"
              placeholder="Street, area, city"
            />
          </div>

          {/* IMAGE SECTION */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-4">
              Upload Complaint Photo (optional)
            </label>

            {preview ? (
              <div className="relative inline-block w-full">
                <img
                  src={preview}
                  alt="preview"
                  className="w-full max-h-72 object-cover rounded-2xl border border-gray-200"
                />
                <button
                  type="button"
                  onClick={() => {
                    setPreview(null);
                    setSelectedImage(null);
                  }}
                  className="absolute top-3 right-3 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 shadow-lg"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 gap-4">
                {/* GALLERY UPLOAD */}
                <label className="flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-2xl p-8 cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-all">
                  <Upload className="w-9 h-9 text-blue-500 mb-3" />
                  <span className="font-semibold text-gray-700">Upload From Gallery</span>
                  <span className="text-xs text-gray-400 mt-1">JPG, PNG up to 5MB</span>
                  <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                </label>

                {/* CAMERA MODAL TRIGGER */}
                <button
                  type="button"
                  onClick={() => setShowCameraModal(true)}
                  className="flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-2xl p-8 cursor-pointer hover:border-emerald-400 hover:bg-emerald-50 transition-all bg-transparent text-center"
                >
                  <Camera className="w-9 h-9 text-emerald-500 mb-3" />
                  <span className="font-semibold text-gray-700">Open In-App Camera</span>
                  <span className="text-xs text-gray-400 mt-1">Realtime frame processing</span>
                </button>
              </div>
            )}
          </div>

          {/* BUTTONS */}
          <div className="flex gap-4 pt-2">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 text-white font-semibold py-3 rounded-xl hover:bg-blue-700 transition-all disabled:opacity-60"
            >
              {loading ? "Submitting..." : "Submit Complaint"}
            </button>

            <button
              type="button"
              onClick={handleReset}
              className="flex items-center gap-2 border border-gray-200 text-gray-700 font-semibold px-6 py-3 rounded-xl hover:bg-gray-50 transition-all"
            >
              <RotateCcw className="w-4 h-4" /> Reset
            </button>
          </div>
        </form>
      </div>

      {/* CONDITIONAL CAMERA OVERLAY MODAL */}
      {showCameraModal && (
        <CameraCapture
          onImageCaptured={handleCameraImageCaptured}
          onCancel={() => setShowCameraModal(false)}
        />
      )}
    </UserLayout>
  );
}