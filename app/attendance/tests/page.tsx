"use client";
import { useState, useRef } from "react";
import { Html5QrcodeScanner } from 'html5-qrcode';

export default function JoinPage() {
  const [roomId, setRoomId] = useState("");
  const [showScanner, setShowScanner] = useState(false);
  const scannerRef = useRef<HTMLDivElement>(null);

  const startScanner = () => {
    if (scannerRef.current) {
      const scanner = new Html5QrcodeScanner(
        scannerRef.current.id,
        { fps: 10, qrbox: 250 },
        false
      );
      scanner.render(
        (decodedText: string) => {
          setRoomId(decodedText);
          scanner.clear();
          setShowScanner(false);
        },
        () => {
          console.log("خطأ في قراءة QR");
        }
      );
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-5">
      <div className="flex justify-center">
        <div className="w-full md:w-1/2">
          <div className="bg-white shadow-lg rounded-lg">
            <div className="p-4">
              <div className="mb-3 flex items-center gap-2">
                <label htmlFor="roomId" className="block text-sm font-medium text-gray-700 mb-0">
                  رقم الغرفة
                </label>
                <button type="button" className="border border-gray-600 text-gray-600 hover:bg-gray-600 hover:text-white px-3 py-1 rounded text-sm" onClick={() => { setShowScanner(true); setTimeout(startScanner, 100); }}>
                  <span role="img" aria-label="scan">📷</span> QR
                </button>
              </div>
              {showScanner && (
                <div className="mb-3">
                  <div id="qr-reader" ref={scannerRef} className="w-full"></div>
                  <button type="button" className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded mt-2" onClick={() => setShowScanner(false)}>إغلاق</button>
                </div>
              )}
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 mb-3"
                id="roomId"
                value={roomId}
                onChange={(e) => setRoomId(e.target.value)}
                placeholder="أدخل رقم الغرفة أو استخدم QR"
                title="رقم الغرفة"
                disabled={showScanner}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
