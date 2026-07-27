const fs = require('fs');

let appContent = fs.readFileSync('src/App.jsx', 'utf8');

// 1. Remove old imports
appContent = appContent.replace('import AdminPurchaseOrders from "./pages/admin/InventoryERP/AdminPurchaseOrders";\n', '');
appContent = appContent.replace('import AdminGRN from "./pages/admin/InventoryERP/AdminGRN";\n', '');

// 2. Add new imports right after AdminItemMaster
const newImports = `import AdminCategories from "./pages/admin/InventoryERP/AdminCategories";
import AdminSuppliers from "./pages/admin/InventoryERP/AdminSuppliers";
import AdminPurchaseManagement from "./pages/admin/InventoryERP/AdminPurchaseManagement";
import AdminStoreRoom from "./pages/admin/InventoryERP/AdminStoreRoom";
import AdminInventoryRequests from "./pages/admin/InventoryERP/AdminInventoryRequests";
import AdminAssetManagement from "./pages/admin/InventoryERP/AdminAssetManagement";
import AdminInventoryReports from "./pages/admin/InventoryERP/AdminInventoryReports";
import AdminRecipeManagement from "./pages/admin/Prasadam/AdminRecipeManagement";
`;

appContent = appContent.replace(
  'import AdminItemMaster from "./pages/admin/InventoryERP/AdminItemMaster";\n',
  'import AdminItemMaster from "./pages/admin/InventoryERP/AdminItemMaster";\n' + newImports
);

// 3. Remove old routes
const route1 = `      <Route
        path="/admin/inventory/purchase-orders"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <AdminLayout>
              <AdminPurchaseOrders />
            </AdminLayout>
          </ProtectedRoute>
        }
      />
`;
const route2 = `      <Route
        path="/admin/inventory/grn"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <AdminLayout>
              <AdminGRN />
            </AdminLayout>
          </ProtectedRoute>
        }
      />
`;
appContent = appContent.replace(route1, '');
appContent = appContent.replace(route2, '');

// 4. Add new routes right before the catch-all
const newRoutes = `      <Route path="/admin/inventory/categories" element={<ProtectedRoute allowedRoles={["admin"]}><AdminLayout><AdminCategories /></AdminLayout></ProtectedRoute>} />
      <Route path="/admin/inventory/suppliers" element={<ProtectedRoute allowedRoles={["admin"]}><AdminLayout><AdminSuppliers /></AdminLayout></ProtectedRoute>} />
      <Route path="/admin/inventory/purchase-management" element={<ProtectedRoute allowedRoles={["admin"]}><AdminLayout><AdminPurchaseManagement /></AdminLayout></ProtectedRoute>} />
      <Route path="/admin/inventory/store-room" element={<ProtectedRoute allowedRoles={["admin"]}><AdminLayout><AdminStoreRoom /></AdminLayout></ProtectedRoute>} />
      <Route path="/admin/inventory/requests" element={<ProtectedRoute allowedRoles={["admin"]}><AdminLayout><AdminInventoryRequests /></AdminLayout></ProtectedRoute>} />
      <Route path="/admin/inventory/assets" element={<ProtectedRoute allowedRoles={["admin"]}><AdminLayout><AdminAssetManagement /></AdminLayout></ProtectedRoute>} />
      <Route path="/admin/inventory/reports" element={<ProtectedRoute allowedRoles={["admin"]}><AdminLayout><AdminInventoryReports /></AdminLayout></ProtectedRoute>} />
      <Route path="/admin/prasada/recipes" element={<ProtectedRoute allowedRoles={["admin"]}><AdminLayout><AdminRecipeManagement /></AdminLayout></ProtectedRoute>} />
`;

appContent = appContent.replace(
  '      <Route\n        path="/admin/inventory/*"',
  newRoutes + '      <Route\n        path="/admin/inventory/*"'
);

fs.writeFileSync('src/App.jsx', appContent);
