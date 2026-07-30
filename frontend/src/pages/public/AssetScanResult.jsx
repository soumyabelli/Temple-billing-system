import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";

const AssetScanResult = () => {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchAssetData = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`http://localhost:5000/api/admin/assets/scan/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.data.success) {
          setData(res.data);
        } else {
          setError(res.data.message || "Asset not found");
        }
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load asset details.");
      } finally {
        setLoading(false);
      }
    };

    fetchAssetData();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#ff8b00]"></div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Error</h2>
          <p className="text-slate-600 mb-6">{error}</p>
          <Link to="/" className="inline-block bg-[#ff8b00] text-white px-6 py-2 rounded-lg font-medium hover:bg-[#e67d00] transition-colors">
            Go to Homepage
          </Link>
        </div>
      </div>
    );
  }

  const { asset, maintenanceHistory } = data;

  return (
    <div className="min-h-screen bg-[#faf9f7] p-4 md:p-8 font-sans">
      <div className="max-w-3xl mx-auto">
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-tr from-[#ff8b00] to-[#ffaf4d] text-white mb-4 shadow-lg shadow-orange-500/30">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
          </div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Asset Details</h1>
          <p className="text-slate-500">Scanned Information</p>
        </div>

        {/* Asset Info Card */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden mb-8">
          <div className="bg-slate-50 border-b border-slate-200 px-6 py-4 flex justify-between items-center">
            <h2 className="text-lg font-bold text-slate-800">{asset.name}</h2>
            <span className={`px-3 py-1 text-sm font-semibold rounded-full ${
              asset.status === 'Active' ? 'bg-emerald-100 text-emerald-700' :
              asset.status === 'Under Repair' ? 'bg-amber-100 text-amber-700' :
              'bg-slate-100 text-slate-700'
            }`}>
              {asset.status}
            </span>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-8">
              <div>
                <p className="text-sm text-slate-500 font-medium mb-1">Asset ID</p>
                <p className="text-slate-900 font-semibold">{asset.assetId}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500 font-medium mb-1">Category</p>
                <p className="text-slate-900 font-semibold">{asset.category}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500 font-medium mb-1">Assigned Location</p>
                <p className="text-slate-900 font-semibold flex items-center">
                  <svg className="w-4 h-4 mr-1 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                  {asset.assignedLocation}
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-500 font-medium mb-1">Purchase Date</p>
                <p className="text-slate-900 font-semibold">{asset.purchaseDate ? new Date(asset.purchaseDate).toLocaleDateString() : 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500 font-medium mb-1">Supplier</p>
                <p className="text-slate-900 font-semibold">{asset.supplier}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500 font-medium mb-1">Warranty</p>
                <p className="text-slate-900 font-semibold">{asset.warranty || 'N/A'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Maintenance History */}
        <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center">
          <svg className="w-6 h-6 mr-2 text-[#ff8b00]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
          Maintenance History
        </h3>

        {maintenanceHistory && maintenanceHistory.length > 0 ? (
          <div className="relative border-l-2 border-slate-200 ml-4 space-y-8 pb-8">
            {maintenanceHistory.map((ticket, index) => (
              <div key={ticket._id} className="relative pl-6">
                <div className={`absolute -left-[9px] top-1 w-4 h-4 rounded-full border-2 border-white ${ticket.status === 'Completed' || ticket.status === 'Closed' ? 'bg-emerald-500' : 'bg-[#ff8b00]'}`}></div>
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
                  <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-3 gap-2">
                    <h4 className="font-bold text-slate-800 text-lg">Ticket #{ticket.ticketNumber}</h4>
                    <span className={`self-start px-2.5 py-1 text-xs font-semibold rounded-full ${
                      ticket.status === 'Completed' || ticket.status === 'Closed' ? 'bg-emerald-100 text-emerald-700' :
                      ticket.status === 'In Progress' ? 'bg-blue-100 text-blue-700' :
                      'bg-slate-100 text-slate-700'
                    }`}>
                      {ticket.status}
                    </span>
                  </div>
                  <p className="text-slate-600 mb-4">{ticket.issueDescription}</p>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <div>
                      <p className="text-slate-500 font-medium">Reported By</p>
                      <p className="text-slate-800 font-semibold">{ticket.reportedBy?.name || 'Unknown'}</p>
                    </div>
                    <div>
                      <p className="text-slate-500 font-medium">Date</p>
                      <p className="text-slate-800 font-semibold">{new Date(ticket.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  
                  {ticket.resolutionNotes && (
                    <div className="mt-4 pt-4 border-t border-slate-100">
                      <p className="text-sm text-slate-500 font-medium mb-1">Resolution Notes</p>
                      <p className="text-sm text-slate-700">{ticket.resolutionNotes}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 text-center text-slate-500">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3">
              <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
            </div>
            <p>No maintenance history found for this asset.</p>
          </div>
        )}

      </div>
    </div>
  );
};

export default AssetScanResult;
