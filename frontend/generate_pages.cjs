const fs = require('fs');

const pages = [
  { name: 'AdminCategories', title: 'Categories', desc: 'Manage inventory categories.', ui: 'Categories' },
  { name: 'AdminSuppliers', title: 'Suppliers', desc: 'Manage supplier information and contacts.', ui: 'Suppliers' },
  { name: 'AdminStoreRoom', title: 'Store Room', desc: 'Manage store room inventory and locations.', ui: 'Store Room' },
  { name: 'AdminInventoryRequests', title: 'Inventory Requests', desc: 'Manage and approve inventory requests.', ui: 'Inventory Requests' },
  { name: 'AdminMaterialKits', title: 'Material Kits', desc: 'Manage predefined material kits for poojas and events.', ui: 'Material Kits' },
  { name: 'AdminKitchenRecipes', title: 'Kitchen Recipes', desc: 'Manage recipes and ingredients for Prasadam.', ui: 'Kitchen Recipes' },
  { name: 'AdminAssetManagement', title: 'Asset Management', desc: 'Manage temple assets and equipment.', ui: 'Asset Management' },
  { name: 'AdminRepairs', title: 'Repairs', desc: 'Manage repair requests and maintenance.', ui: 'Repairs' },
  { name: 'AdminDamageWriteOff', title: 'Damage & Write-Off', desc: 'Manage damaged items and write-offs.', ui: 'Damage & Write-Off' },
  { name: 'AdminExpiryManagement', title: 'Expiry Management', desc: 'Track and manage expiring inventory.', ui: 'Expiry Management' },
  { name: 'AdminStockAudit', title: 'Stock Audit', desc: 'Perform and review stock audits.', ui: 'Stock Audit' },
  { name: 'AdminStockTransfers', title: 'Stock Transfers', desc: 'Manage stock transfers between locations.', ui: 'Stock Transfers' },
  { name: 'AdminInventoryReports', title: 'Reports', desc: 'View and generate inventory reports.', ui: 'Inventory Reports' },
  { name: 'AdminInventorySettings', title: 'Settings', desc: 'Manage inventory module settings.', ui: 'Inventory Settings' },
];

pages.forEach(p => {
  const content = `import React from "react";

const ${p.name} = () => {
  return (
    <div className="p-4 md:p-8 bg-[#faf9f7] min-h-screen">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#1d1b19]">${p.title}</h1>
        <p className="text-sm text-[#5c6675]">${p.desc}</p>
        <div className="mt-2 h-1 w-12 rounded-full bg-[#ff8b00]" />
      </div>
      
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm flex items-center justify-center min-h-[400px] text-slate-500">
        ${p.ui} UI goes here.
      </div>
    </div>
  );
};

export default ${p.name};
`;
  fs.writeFileSync('src/pages/admin/InventoryERP/' + p.name + '.jsx', content);
});
