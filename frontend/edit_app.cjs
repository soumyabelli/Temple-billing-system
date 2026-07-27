const fs = require('fs');
let content = fs.readFileSync('src/App.jsx', 'utf8');

const importsToRemove = [
  'AdminPurchaseOrders', 'AdminGRN', 'AdminMaterialKits',
  'AdminKitchenRecipes', 'AdminRepairs', 'AdminDamageWriteOff',
  'AdminExpiryManagement', 'AdminStockAudit', 'AdminStockTransfers',
  'AdminInventorySettings'
];

importsToRemove.forEach(imp => {
  content = content.replace(new RegExp('import ' + imp + ' from .*?;\\n', 'g'), '');
});

const newImports = `import AdminPurchaseManagement from "./pages/admin/InventoryERP/AdminPurchaseManagement";
import AdminRecipeManagement from "./pages/admin/Prasadam/AdminRecipeManagement";
`;
content = content.replace('import AdminItemMaster from "./pages/admin/InventoryERP/AdminItemMaster";\n', 'import AdminItemMaster from "./pages/admin/InventoryERP/AdminItemMaster";\n' + newImports);

const routesRegex = /<Route\s+path="\/admin\/inventory\/purchase-orders"[\s\S]*?<Route\s+path="\/admin\/inventory\/settings"[\s\S]*?<\/ProtectedRoute>\s*}\s*\/>/m;

const newRoutes = `<Route path="/admin/inventory/purchase-management" element={<ProtectedRoute allowedRoles={["admin"]}><AdminLayout><AdminPurchaseManagement /></AdminLayout></ProtectedRoute>} />
      <Route path="/admin/prasada/recipes" element={<ProtectedRoute allowedRoles={["admin"]}><AdminLayout><AdminRecipeManagement /></AdminLayout></ProtectedRoute>} />`;

content = content.replace(routesRegex, newRoutes);

fs.writeFileSync('src/App.jsx', content);
