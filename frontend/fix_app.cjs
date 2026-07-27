const fs = require('fs');
let content = fs.readFileSync('src/App.jsx', 'utf8');

const restoredRoutes = `      <Route path="/admin/inventory/categories" element={<ProtectedRoute allowedRoles={["admin"]}><AdminLayout><AdminCategories /></AdminLayout></ProtectedRoute>} />
      <Route path="/admin/inventory/suppliers" element={<ProtectedRoute allowedRoles={["admin"]}><AdminLayout><AdminSuppliers /></AdminLayout></ProtectedRoute>} />
      <Route path="/admin/inventory/store-room" element={<ProtectedRoute allowedRoles={["admin"]}><AdminLayout><AdminStoreRoom /></AdminLayout></ProtectedRoute>} />
      <Route path="/admin/inventory/requests" element={<ProtectedRoute allowedRoles={["admin"]}><AdminLayout><AdminInventoryRequests /></AdminLayout></ProtectedRoute>} />
      <Route path="/admin/inventory/assets" element={<ProtectedRoute allowedRoles={["admin"]}><AdminLayout><AdminAssetManagement /></AdminLayout></ProtectedRoute>} />
      <Route path="/admin/inventory/reports" element={<ProtectedRoute allowedRoles={["admin"]}><AdminLayout><AdminInventoryReports /></AdminLayout></ProtectedRoute>} />`;

content = content.replace(
  '<Route path="/admin/prasada/recipes" element={<ProtectedRoute allowedRoles={["admin"]}><AdminLayout><AdminRecipeManagement /></AdminLayout></ProtectedRoute>} />',
  '<Route path="/admin/prasada/recipes" element={<ProtectedRoute allowedRoles={["admin"]}><AdminLayout><AdminRecipeManagement /></AdminLayout></ProtectedRoute>} />\n' + restoredRoutes
);

const restoredImports = `import AdminCategories from "./pages/admin/InventoryERP/AdminCategories";
import AdminSuppliers from "./pages/admin/InventoryERP/AdminSuppliers";
import AdminStoreRoom from "./pages/admin/InventoryERP/AdminStoreRoom";
import AdminInventoryRequests from "./pages/admin/InventoryERP/AdminInventoryRequests";
import AdminAssetManagement from "./pages/admin/InventoryERP/AdminAssetManagement";
import AdminInventoryReports from "./pages/admin/InventoryERP/AdminInventoryReports";`;

content = content.replace(
  'import AdminRecipeManagement from "./pages/admin/Prasadam/AdminRecipeManagement";',
  'import AdminRecipeManagement from "./pages/admin/Prasadam/AdminRecipeManagement";\n' + restoredImports
);

fs.writeFileSync('src/App.jsx', content);
