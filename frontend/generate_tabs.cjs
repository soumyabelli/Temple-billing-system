const fs = require('fs');

const tabbedTemplate = (name, title, desc, tabs) => `import React, { useState } from "react";

const ${name} = () => {
  const [activeTab, setActiveTab] = useState("${tabs[0]}");

  const tabs = ${JSON.stringify(tabs)};

  return (
    <div className="p-4 md:p-8 bg-[#faf9f7] min-h-screen">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#1d1b19]">${title}</h1>
        <p className="text-sm text-[#5c6675]">${desc}</p>
        <div className="mt-2 h-1 w-12 rounded-full bg-[#ff8b00]" />
      </div>
      
      {/* Tabs */}
      <div className="flex space-x-1 border-b border-slate-200 mb-6 overflow-x-auto pb-1">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={\`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors whitespace-nowrap \${
              activeTab === tab
                ? "bg-white text-[#ff8b00] border-t border-l border-r border-slate-200 shadow-sm"
                : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
            }\`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm flex items-center justify-center min-h-[400px] text-slate-500">
        {activeTab} UI goes here.
      </div>
    </div>
  );
};

export default ${name};
`;

const componentsToGenerate = [
  {
    name: 'AdminPurchaseManagement',
    title: 'Purchase Management',
    desc: 'Manage purchase orders, goods received, invoices, and returns.',
    path: 'InventoryERP/AdminPurchaseManagement.jsx',
    tabs: ['Purchase Orders', 'Goods Received', 'Invoices', 'Purchase History', 'Purchase Returns', 'Supplier Bills']
  },
  {
    name: 'AdminStoreRoom',
    title: 'Store Room',
    desc: 'Manage current stock and inventory status.',
    path: 'InventoryERP/AdminStoreRoom.jsx',
    tabs: ['Current Stock', 'Low Stock', 'Reserved Stock', 'Issued', 'Damaged', 'Expired', 'Write-Off', 'History']
  },
  {
    name: 'AdminInventoryRequests',
    title: 'Inventory Requests',
    desc: 'Manage and approve inventory requests.',
    path: 'InventoryERP/AdminInventoryRequests.jsx',
    tabs: ['Pending', 'Approved', 'Rejected', 'Issued', 'Completed']
  },
  {
    name: 'AdminAssetManagement',
    title: 'Asset Management',
    desc: 'Manage temple assets, maintenance, and repairs.',
    path: 'InventoryERP/AdminAssetManagement.jsx',
    tabs: ['Assets', 'Maintenance', 'Repairs', 'Service History', 'Warranty', 'Scrapped']
  },
  {
    name: 'AdminInventoryReports',
    title: 'Reports',
    desc: 'View and generate inventory reports.',
    path: 'InventoryERP/AdminInventoryReports.jsx',
    tabs: ['Inventory Report', 'Purchase Report', 'Consumption Report', 'Damage Report', 'Expiry Report', 'Audit Report', 'Asset Report', 'Supplier Report', 'Stock Movement', 'Low Stock Report']
  }
];

componentsToGenerate.forEach(c => {
  const content = tabbedTemplate(c.name, c.title, c.desc, c.tabs);
  fs.writeFileSync('src/pages/admin/' + c.path, content);
});

// AdminRecipeManagement (no tabs requested, just standard)
const recipeTemplate = `import React from "react";

const AdminRecipeManagement = () => {
  return (
    <div className="p-4 md:p-8 bg-[#faf9f7] min-h-screen">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#1d1b19]">Recipe Management</h1>
        <p className="text-sm text-[#5c6675]">Manage recipes and ingredients for Prasadam.</p>
        <div className="mt-2 h-1 w-12 rounded-full bg-[#ff8b00]" />
      </div>
      
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm flex items-center justify-center min-h-[400px] text-slate-500">
        Recipe Management UI goes here.
      </div>
    </div>
  );
};

export default AdminRecipeManagement;
`;

fs.mkdirSync('src/pages/admin/Prasadam', { recursive: true });
fs.writeFileSync('src/pages/admin/Prasadam/AdminRecipeManagement.jsx', recipeTemplate);
