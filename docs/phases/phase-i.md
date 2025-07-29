

```markdown
# **Phase I: Admin Dashboard & Internal Tooling**

**Goal:** Develop the necessary internal tools for application management. This involves building a secure admin dashboard where authorized users can **manage user accounts and subscriptions**, **review teledermatology consultation requests**, and **manage the master `Product` catalog**.

---

### 1. Backend API Implementation (Admin Routes)

-   `[ ]` **Task 1.1: Create Admin API for Product Catalog Management (CRUD)**
    -   **File:** `src/app/api/admin/products/route.ts`
        -   **Action:** Implement `GET` to list all products and `POST` to create a new product, protected by admin middleware.
        -   **Content:**
            ```typescript
            import { NextRequest, NextResponse } from "next/server";
            import { prisma } from "@/lib/db";
            import { authMiddleware } from "@/lib/auth";
            import { z } from "zod";
            
            export async function GET(request: NextRequest) {
              try {
                await authMiddleware(request); // Admin check
                const products = await prisma.product.findMany({ orderBy: { name: 'asc' } });
                return NextResponse.json(products);
              } catch (e) { return NextResponse.json({ error: (e as Error).message }, { status: 403 }); }
            }
            
            const productSchema = z.object({
              name: z.string().min(1),
              brand: z.string().optional(),
              type: z.string().min(1),
              description: z.string().min(1),
            });
            
            export async function POST(request: NextRequest) {
              try {
                await authMiddleware(request); // Admin check
                const body = await request.json();
                const parsed = productSchema.safeParse(body);
                if (!parsed.success) return NextResponse.json({ error: parsed.error }, { status: 400 });
                
                const product = await prisma.product.create({ data: parsed.data });
                return NextResponse.json(product, { status: 201 });
              } catch (e) { return NextResponse.json({ error: (e as Error).message }, { status: 403 }); }
            }
            ```
    -   **File:** `src/app/api/admin/products/[id]/route.ts`
        -   **Action:** Implement `PUT` to update and `DELETE` to remove a product.
        -   **Content:**
            ```typescript
            import { NextRequest, NextResponse } from "next/server";
            import { prisma } from "@/lib/db";
            import { authMiddleware } from "@/lib/auth";
            import { z } from "zod";

            const productSchema = z.object({
              name: z.string().min(1),
              brand: z.string().optional(),
              type: z.string().min(1),
              description: z.string().min(1),
            });

            export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
              try {
                await authMiddleware(request); // Admin check
                const body = await request.json();
                const parsed = productSchema.safeParse(body);
                if (!parsed.success) return NextResponse.json({ error: parsed.error }, { status: 400 });

                const product = await prisma.product.update({
                  where: { id: params.id },
                  data: parsed.data,
                });
                return NextResponse.json(product);
              } catch (e) { return NextResponse.json({ error: (e as Error).message }, { status: 403 }); }
            }

            export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
              try {
                await authMiddleware(request); // Admin check
                await prisma.product.delete({ where: { id: params.id } });
                return NextResponse.json({ success: true });
              } catch (e) { return NextResponse.json({ error: (e as Error).message }, { status: 403 }); }
            }
            ```

-   `[ ]` **Task 1.2: Create Admin API for Consultation Management**
    -   **File:** `src/app/api/admin/consultations/route.ts`
        -   **Action:** Implement `GET` to fetch all consultations, with optional filtering by status (e.g., `?status=PENDING`).
        -   **Content:**
            ```typescript
            import { NextRequest, NextResponse } from "next/server";
            import { prisma } from "@/lib/db";
            import { authMiddleware } from "@/lib/auth";

            export async function GET(request: NextRequest) {
              try {
                await authMiddleware(request); // Admin check
                const { searchParams } = new URL(request.url);
                const status = searchParams.get("status");

                const consultations = await prisma.consultation.findMany({
                  where: { status: status || undefined },
                  include: { user: { select: { email: true } }, scan: { select: { id: true, createdAt: true } } },
                  orderBy: { createdAt: 'desc' },
                });
                return NextResponse.json(consultations);
              } catch (e) { return NextResponse.json({ error: (e as Error).message }, { status: 403 }); }
            }
            ```
    -   **File:** `src/app/api/admin/consultations/[id]/route.ts`
        -   **Action:** Implement `GET` to fetch a single consultation's full details and `PUT` to update its status and add notes.
        -   **Content:**
            ```typescript
            import { NextRequest, NextResponse } from "next/server";
            import { prisma } from "@/lib/db";
            import { authMiddleware } from "@/lib/auth";
            import { z } from "zod";
            import { decrypt, encrypt } from "@/lib/encryption";

            export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
                try {
                  await authMiddleware(request); // Admin check
                  const consultation = await prisma.consultation.findUnique({
                    where: { id: params.id },
                    include: { user: { select: { email: true } }, scan: true },
                  });
                  if (consultation?.scan) {
                      consultation.scan.imageUrl = decrypt(consultation.scan.imageUrl) ?? 'DECRYPTION_FAILED';
                  }
                  return NextResponse.json(consultation);
                } catch (e) { return NextResponse.json({ error: (e as Error).message }, { status: 403 }); }
            }
            
            const updateSchema = z.object({
              status: z.string(),
              notes: z.string().optional(),
            });

            export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
              try {
                await authMiddleware(request); // Admin check
                const body = await request.json();
                const parsed = updateSchema.safeParse(body);
                if (!parsed.success) return NextResponse.json({ error: parsed.error }, { status: 400 });

                const consultation = await prisma.consultation.update({
                  where: { id: params.id },
                  data: {
                    status: parsed.data.status,
                    notes: parsed.data.notes ? encrypt(parsed.data.notes) : undefined,
                  },
                });
                return NextResponse.json(consultation);
              } catch (e) { return NextResponse.json({ error: (e as Error).message }, { status: 403 }); }
            }
            ```

---

### 2. Frontend Data Hooks & API Client

-   `[ ]` **Task 2.1: Implement Admin-Specific Data Hooks**
    -   **File:** `src/lib/hooks/admin-hooks.ts`
    -   **Action:** Extend this file with fully implemented hooks for Products and Consultations.
    -   **Content Snippet (to add):**
        ```typescript
        // Product Hooks
        export const useAdminProducts = () => useQuery({ queryKey: ["admin-products"], queryFn: apiClient.admin.getProducts });
        
        export const useCreateProduct = () => {
          const queryClient = useQueryClient();
          const { toast } = useToast();
          return useMutation({
            mutationFn: apiClient.admin.createProduct,
            onSuccess: () => {
              queryClient.invalidateQueries({ queryKey: ["admin-products"] });
              toast({ title: "Product Created" });
            },
            onError: (err) => toast({ variant: "destructive", title: "Error", description: (err as Error).message }),
          });
        };

        // ... Implement useUpdateProduct and useDeleteProduct similarly ...

        // Consultation Hooks
        export const useAdminConsultations = (status?: string) => useQuery({ queryKey: ["admin-consultations", status || 'all'], queryFn: () => apiClient.admin.getConsultations({ status }) });
        export const useAdminConsultation = (id: string) => useQuery({ queryKey: ["admin-consultation", id], queryFn: () => apiClient.admin.getConsultation(id), enabled: !!id });

        export const useUpdateConsultation = () => {
          const queryClient = useQueryClient();
          const { toast } = useToast();
          return useMutation({
            mutationFn: ({ id, payload }: { id: string, payload: { status: string; notes?: string } }) => apiClient.admin.updateConsultation(id, payload),
            onSuccess: (_, { id }) => {
              queryClient.invalidateQueries({ queryKey: ["admin-consultations"] });
              queryClient.invalidateQueries({ queryKey: ["admin-consultation", id] });
              toast({ title: "Consultation Updated" });
            },
            onError: (err) => toast({ variant: "destructive", title: "Error", description: (err as Error).message }),
          });
        };
        ```

-   `[ ]` **Task 2.2: Expand the API Client**
    -   **File:** `src/lib/services/api-client.service.ts`
    -   **Action:** Add the new admin methods to the `apiClient` object.
    -   **Content Snippet (to add within `apiClient.admin`):**
        ```typescript
        // ... inside apiClient.admin
        getProducts: async () => { const { data } = await axios.get("/api/admin/products"); return data; },
        createProduct: async (payload: any) => { const { data } = await axios.post("/api/admin/products", payload); return data; },
        updateProduct: async (id: string, payload: any) => { const { data } = await axios.put(`/api/admin/products/${id}`, payload); return data; },
        deleteProduct: async (id: string) => { await axios.delete(`/api/admin/products/${id}`); },
        getConsultations: async (params?: { status?: string }) => { const { data } = await axios.get("/api/admin/consultations", { params }); return data; },
        getConsultation: async (id: string) => { const { data } = await axios.get(`/api/admin/consultations/${id}`); return data; },
        updateConsultation: async (id: string, payload: { status: string; notes?: string }) => { const { data } = await axios.put(`/api/admin/consultations/${id}`, payload); return data; },
        ```

---

### 3. UI Component Implementation

-   `[ ]` **Task 3.1: Create Product Management Components**
    -   **File:** `src/components/admin/ProductList.tsx`
        -   **Purpose:** Displays all products in a table.
        -   **UI:** A `Table` component with columns for Name, Brand, Type, and an actions column with "Edit" and "Delete" buttons.
        -   **Hooks:** Uses `useAdminProducts` to fetch data and `useDeleteProduct` for the delete action.
    -   **File:** `src/components/admin/ProductFormDialog.tsx`
        -   **Purpose:** A dialog for creating a new product or editing an existing one.
        -   **UI:** A `Dialog` containing a form with `Input` fields for Name, Brand, Type, and a `Textarea` for Description.
        -   **Hooks:** Uses `useCreateProduct` or `useUpdateProduct`.
        -   **Props:** `isOpen`, `onClose`, `productToEdit?` (optional).

-   `[ ]` **Task 3.2: Create Consultation Management Components**
    -   **File:** `src/components/admin/ConsultationList.tsx`
        -   **Purpose:** Displays a list of consultations, filterable by status.
        -   **UI:** A `Tabs` component for filtering ("Pending", "Completed"). Each tab contains a `Table` showing User Email, Scan Date, and Status. Rows are clickable to open the review modal.
        -   **Hooks:** Uses `useAdminConsultations` with different status parameters.
    -   **File:** `src/components/admin/ConsultationReviewModal.tsx`
        -   **Purpose:** The main interface for a dermatologist to review a consultation.
        -   **UI:** A large `Dialog` displaying the scan image, user details, and a form with a `Textarea` for notes and a `Select` to update the status.
        -   **Hooks:** Uses `useAdminConsultation` to fetch details and `useUpdateConsultation` to submit the review.
        -   **Props:** `consultationId`, `isOpen`, `onClose`.

---

### 4. Page Assembly & Final Polish

-   `[ ]` **Task 4.1: Build the Main Admin Dashboard Page**
    -   **File:** `src/app/admin/page.tsx`
    -   **Action:** Assemble the main admin interface using `Tabs` to switch between Users, Products, and Consultations panels.
    -   **Content Snippet:**
        ```tsx
        // ... imports for Tabs, AdminDashboard (for users), ProductList, ConsultationList
        export default function AdminPage() {
          // ... logic to check for admin role
          return (
            <Tabs defaultValue="users">
              <TabsList>
                <TabsTrigger value="users">Users</TabsTrigger>
                <TabsTrigger value="products">Products</TabsTrigger>
                <TabsTrigger value="consultations">Consultations</TabsTrigger>
              </TabsList>
              <TabsContent value="users"><AdminDashboard /></TabsContent>
              <TabsContent value="products"><ProductList /></TabsContent>
              <TabsContent value="consultations"><ConsultationList /></TabsContent>
            </Tabs>
          );
        }
        ```

-   `[ ]` **Task 4.2: Add Conditional Admin Link to UI**
    -   **File:** `src/components/layout/DesktopSidebar.tsx` and `src/components/layout/BottomTabBar.tsx`
    -   **Action:** Use the `useUserProfile` hook. If `userProfile.subscriptionTier === 'ADMIN'`, render an additional navigation link pointing to `/admin`.

-   `[ ]` **Task 4.3: Implement Loading & Error States**
    -   **Action:** For all new admin components and pages, use the `isLoading` and `isError` flags from the TanStack Query hooks to display `Skeleton` loaders or user-friendly error messages, ensuring a smooth admin experience.
```