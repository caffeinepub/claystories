import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Toaster } from "@/components/ui/sonner";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  useAddCategory,
  useAddProduct,
  useGetAllProducts,
  useGetBestSellers,
  useGetCategories,
  useGetPaymentSettings,
  usePlaceOrder,
  useRemoveCategory,
  useSetPaymentSettings,
  useUpdateProductStock,
} from "@/hooks/useQueries";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Copy,
  CreditCard,
  Instagram,
  Loader2,
  ShoppingBag,
  Sparkles,
  Tag,
  Trash2,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import type { Category, Product } from "./backend.d";

const queryClient = new QueryClient();

const FALLBACK_CATEGORIES: Category[] = [
  {
    id: "clay-charms",
    name: "Clay Charms",
    emoji: "🧸",
    description: "Adorable handcrafted clay charms for bags, keys and more",
  },
  {
    id: "phone-hippers",
    name: "Phone Hippers",
    emoji: "📱",
    description: "Cute peekaboo charms designed just for your phone",
  },
  {
    id: "worry-stones",
    name: "Worry Stones",
    emoji: "💙",
    description: "Smooth palm-sized stones to hold close on hard days",
  },
];

function nameToSlug(name: string): string {
  return name.toLowerCase().replace(/\s+/g, "-");
}

function getCharmImage(name: string): string {
  const lower = name.toLowerCase();
  if (lower.includes("mushroom"))
    return "/assets/generated/charm-mushroom.dim_400x400.jpg";
  if (lower.includes("flower"))
    return "/assets/generated/charm-flower.dim_400x400.jpg";
  if (lower.includes("cat"))
    return "/assets/generated/charm-cat.dim_400x400.jpg";
  if (lower.includes("strawberry"))
    return "/assets/generated/charm-strawberry.dim_400x400.jpg";
  if (lower.includes("sunflower"))
    return "/assets/generated/charm-sunflower.dim_400x400.jpg";
  if (lower.includes("bunny"))
    return "/assets/generated/charm-bunny.dim_400x400.jpg";
  if (lower.includes("heart"))
    return "/assets/generated/charm-heart.dim_400x400.jpg";
  if (lower.includes("cloud"))
    return "/assets/generated/charm-cloud.dim_400x400.jpg";
  return "/assets/generated/hero-charms.dim_900x600.jpg";
}

const FALLBACK_PRODUCTS: Product[] = [
  {
    id: "1",
    name: "Mushroom Charm",
    description: "A lucky little mushroom to brighten your day ✨",
    priceINR: 249,
    category: "clay-charms",
    inStock: true,
  },
  {
    id: "2",
    name: "Flower Charm",
    description: "Delicate petals captured forever in clay 🌸",
    priceINR: 229,
    category: "clay-charms",
    inStock: true,
  },
  {
    id: "3",
    name: "Cat Charm",
    description: "A tiny feline bestie for your keys or bag 🐱",
    priceINR: 269,
    category: "clay-charms",
    inStock: true,
  },
  {
    id: "4",
    name: "Strawberry Charm",
    description: "Sweet and vivid, just like summer \u2600️",
    priceINR: 219,
    category: "clay-charms",
    inStock: true,
  },
  {
    id: "5",
    name: "Phone Peekaboo Cat",
    description: "A lil' kitty peeking out from your phone case 🐱",
    priceINR: 299,
    category: "phone-hippers",
    inStock: true,
  },
  {
    id: "6",
    name: "Bunny Phone Hipper",
    description: "Soft bunny charm to hang on your phone corner 🐰",
    priceINR: 279,
    category: "phone-hippers",
    inStock: true,
  },
  {
    id: "7",
    name: "Heart Charm",
    description: "A lil' token of warmth and good vibes 💕",
    priceINR: 199,
    category: "clay-charms",
    inStock: true,
  },
  {
    id: "8",
    name: "Cloud Worry Stone",
    description: "Dreamy and smooth, for the head-in-the-clouds type \u2601️",
    priceINR: 229,
    category: "worry-stones",
    inStock: true,
  },
];

interface OrderFormState {
  customerName: string;
  phone: string;
  email: string;
  address: string;
  quantity: string;
}

function OrderModal({
  product,
  open,
  onClose,
}: { product: Product | null; open: boolean; onClose: () => void }) {
  const [step, setStep] = useState<"details" | "payment">("details");
  const [form, setForm] = useState<OrderFormState>({
    customerName: "",
    phone: "",
    email: "",
    address: "",
    quantity: "1",
  });
  const [paymentRef, setPaymentRef] = useState("");
  const [orderId, setOrderId] = useState<string | null>(null);
  const placeOrder = usePlaceOrder();
  const { data: paymentSettings } = useGetPaymentSettings();

  const hasPaymentDetails =
    paymentSettings?.upiId && paymentSettings.upiId.trim() !== "";

  const handleClose = () => {
    setForm({
      customerName: "",
      phone: "",
      email: "",
      address: "",
      quantity: "1",
    });
    setPaymentRef("");
    setOrderId(null);
    setStep("details");
    placeOrder.reset();
    onClose();
  };

  const handleDetailsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStep("payment");
  };

  const handleConfirmOrder = async () => {
    if (!product) return;
    const addressWithPayment = paymentRef.trim()
      ? `${form.address} | Payment Ref/UTR: ${paymentRef.trim()}`
      : form.address;
    try {
      const id = await placeOrder.mutateAsync({
        customerName: form.customerName,
        phone: form.phone,
        email: form.email,
        address: addressWithPayment,
        productId: product.id,
        quantity: BigInt(Math.max(1, Number.parseInt(form.quantity) || 1)),
      });
      setOrderId(id);
      toast.success("yay! order placed 🎉");
    } catch {
      toast.error("oops, something went sideways. try again? 🙏");
    }
  };

  const copyUpi = () => {
    if (paymentSettings?.upiId) {
      navigator.clipboard.writeText(paymentSettings.upiId);
      toast.success("UPI ID copied! 📋");
    }
  };

  const totalPrice = product
    ? product.priceINR * (Number.parseInt(form.quantity) || 1)
    : 0;

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) handleClose();
      }}
    >
      <DialogContent className="max-w-md" data-ocid="order.dialog">
        <DialogHeader>
          <DialogTitle className="font-serif text-xl text-foreground">
            {step === "details" ? (
              <>{product?.name} ✨</>
            ) : (
              <span className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-primary" />
                payment details 💸
              </span>
            )}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            {step === "details" ? (
              <>
                ₹{product?.priceINR} · handcrafted small clay trinket, made just
                for you~
              </>
            ) : (
              <>total: ₹{totalPrice} · almost there, just one more step~</>
            )}
          </DialogDescription>
        </DialogHeader>

        {/* Step indicator */}
        {!orderId && (
          <div className="flex items-center gap-2 mb-1">
            <div
              className={`flex items-center gap-1.5 text-xs font-medium ${
                step === "details" ? "text-primary" : "text-muted-foreground"
              }`}
            >
              <span
                className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                  step === "details"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                1
              </span>
              your details
            </div>
            <div className="flex-1 h-px bg-border" />
            <div
              className={`flex items-center gap-1.5 text-xs font-medium ${
                step === "payment" ? "text-primary" : "text-muted-foreground"
              }`}
            >
              <span
                className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                  step === "payment"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                2
              </span>
              payment
            </div>
          </div>
        )}

        {orderId ? (
          <div
            className="flex flex-col items-center gap-4 py-6"
            data-ocid="order.success_state"
          >
            <CheckCircle2 className="w-14 h-14 text-primary" />
            <div className="text-center">
              <p className="font-serif text-lg font-semibold text-foreground">
                order placed! 🥳
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                your order id is
              </p>
              <p className="font-mono font-bold text-primary mt-1 text-sm break-all">
                {orderId}
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                we'll reach out on your phone/email to confirm delivery 💌
              </p>
            </div>
            <Button
              onClick={handleClose}
              className="mt-2 bg-primary hover:bg-primary/90 text-primary-foreground"
              data-ocid="order.close_button"
            >
              yay, done!
            </Button>
          </div>
        ) : step === "details" ? (
          <form
            onSubmit={handleDetailsSubmit}
            className="flex flex-col gap-4 mt-2"
          >
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="order-name">your name *</Label>
              <Input
                id="order-name"
                value={form.customerName}
                onChange={(e) =>
                  setForm((p) => ({ ...p, customerName: e.target.value }))
                }
                placeholder="what do we call you?"
                required
                data-ocid="order.input"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="order-phone">phone number *</Label>
              <Input
                id="order-phone"
                value={form.phone}
                onChange={(e) =>
                  setForm((p) => ({ ...p, phone: e.target.value }))
                }
                placeholder="+91 98765 43210"
                type="tel"
                required
                data-ocid="order.input"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="order-email">email *</Label>
              <Input
                id="order-email"
                value={form.email}
                onChange={(e) =>
                  setForm((p) => ({ ...p, email: e.target.value }))
                }
                placeholder="you@example.com"
                type="email"
                required
                data-ocid="order.input"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="order-address">delivery address *</Label>
              <Textarea
                id="order-address"
                value={form.address}
                onChange={(e) =>
                  setForm((p) => ({ ...p, address: e.target.value }))
                }
                placeholder="full address with pincode~"
                rows={3}
                required
                data-ocid="order.textarea"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="order-qty">how many? 🌿</Label>
              <Input
                id="order-qty"
                value={form.quantity}
                onChange={(e) =>
                  setForm((p) => ({ ...p, quantity: e.target.value }))
                }
                type="number"
                min={1}
                max={50}
                required
                data-ocid="order.input"
              />
            </div>
            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                className="flex-1"
                data-ocid="order.cancel_button"
              >
                maybe later
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
                data-ocid="order.primary_button"
              >
                next: pay 💳
              </Button>
            </div>
          </form>
        ) : (
          <div className="flex flex-col gap-4 mt-2">
            {/* No COD warning */}
            <div
              className="flex items-center gap-2.5 rounded-lg border border-destructive/40 bg-destructive/8 px-4 py-3"
              data-ocid="order.panel"
            >
              <AlertCircle className="w-4 h-4 text-destructive shrink-0" />
              <p className="text-sm font-medium text-destructive">
                no cash on delivery -- online payment only 🚫
              </p>
            </div>

            {hasPaymentDetails ? (
              <>
                {/* UPI ID */}
                <div className="flex flex-col gap-1.5">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    pay via UPI
                  </p>
                  <div className="flex items-center gap-2 rounded-lg border border-primary/30 bg-primary/5 px-4 py-3">
                    <span className="flex-1 font-mono font-semibold text-primary text-sm break-all">
                      {paymentSettings?.upiId}
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={copyUpi}
                      className="shrink-0 h-7 w-7 p-0 hover:bg-primary/10"
                      data-ocid="order.button"
                      aria-label="Copy UPI ID"
                    >
                      <Copy className="w-3.5 h-3.5 text-primary" />
                    </Button>
                  </div>
                </div>

                {/* Instructions */}
                {paymentSettings?.instructions && (
                  <div className="rounded-lg bg-muted/50 px-4 py-3">
                    <p className="text-sm text-foreground leading-relaxed">
                      {paymentSettings.instructions}
                    </p>
                  </div>
                )}
              </>
            ) : (
              <div className="rounded-lg border border-accent/30 bg-accent/8 px-4 py-4 text-center">
                <p className="text-sm text-foreground/80 leading-relaxed">
                  payment details coming soon~ we'll reach out to confirm! 💌
                </p>
              </div>
            )}

            {/* Payment reference */}
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="payment-ref">
                payment reference / UTR number
                <span className="text-muted-foreground font-normal">
                  {" "}
                  (optional)
                </span>
              </Label>
              <Input
                id="payment-ref"
                value={paymentRef}
                onChange={(e) => setPaymentRef(e.target.value)}
                placeholder="paste your transaction ID here~"
                data-ocid="order.input"
              />
              <p className="text-xs text-muted-foreground">
                share this after paying so we can verify faster 🎉
              </p>
            </div>

            {placeOrder.isError && (
              <p
                className="text-sm text-destructive"
                data-ocid="order.error_state"
              >
                something went wrong~ please try again!
              </p>
            )}

            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setStep("details")}
                className="flex items-center gap-1.5"
                data-ocid="order.cancel_button"
              >
                <ArrowLeft className="w-4 h-4" />
                back
              </Button>
              <Button
                type="button"
                onClick={handleConfirmOrder}
                disabled={placeOrder.isPending}
                className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
                data-ocid="order.submit_button"
              >
                {placeOrder.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" /> placing...
                  </>
                ) : (
                  "confirm order 💕"
                )}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function ProductCard({
  product,
  index,
  onOrder,
}: { product: Product; index: number; onOrder: (p: Product) => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.45, delay: index * 0.07 }}
      className="bg-card rounded-xl overflow-hidden shadow-card flex flex-col"
      data-ocid={`bestsellers.item.${index + 1}`}
    >
      <div className="aspect-square overflow-hidden">
        <img
          src={getCharmImage(product.name)}
          alt={product.name}
          className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
      </div>
      <div className="p-4 flex flex-col gap-2 flex-1">
        <h3 className="font-serif font-semibold text-foreground text-lg leading-tight">
          {product.name}
        </h3>
        <p className="text-sm text-muted-foreground flex-1 line-clamp-2">
          {product.description}
        </p>
        <div className="flex items-center justify-between mt-2">
          <span className="font-serif font-bold text-primary text-lg">
            ₹{product.priceINR}
          </span>
          {!product.inStock && (
            <span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full">
              sold out~
            </span>
          )}
        </div>
        <Button
          onClick={() => onOrder(product)}
          disabled={!product.inStock}
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground mt-1"
          data-ocid={`bestsellers.item.${index + 1}`}
        >
          {product.inStock ? "order now 🛍️" : "out of stock"}
        </Button>
      </div>
    </motion.div>
  );
}

function BestsellersSection({
  onOrder,
  activeCategory,
}: {
  onOrder: (p: Product) => void;
  activeCategory: string | null;
}) {
  const { data, isLoading } = useGetBestSellers();
  const { data: categoriesData } = useGetCategories();
  const allProducts = data && data.length > 0 ? data : FALLBACK_PRODUCTS;
  const categories =
    categoriesData && categoriesData.length > 0
      ? categoriesData
      : FALLBACK_CATEGORIES;

  const filteredProducts = activeCategory
    ? allProducts.filter((p) => {
        const slug = nameToSlug(p.category);
        return slug === activeCategory || p.category === activeCategory;
      })
    : allProducts;

  const activeCategoryObj = activeCategory
    ? categories.find((c) => c.id === activeCategory)
    : null;

  const sectionTitle = activeCategoryObj
    ? `${activeCategoryObj.name} ${activeCategoryObj.emoji}`
    : "our lil' bestsellers 🌟";

  return (
    <section id="bestsellers" className="py-16 px-4 bg-section-band">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 className="font-serif text-4xl font-bold text-foreground mb-3">
            {sectionTitle}
          </h2>
          <p className="text-muted-foreground text-base max-w-xl mx-auto">
            {activeCategory
              ? "browse our handcrafted collection, made with love~"
              : "these cuties fly off the shelf ~ grab yours before they're gone!"}
          </p>
        </motion.div>

        {isLoading ? (
          <div
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
            data-ocid="bestsellers.loading_state"
          >
            {["s0", "s1", "s2", "s3", "s4", "s5", "s6", "s7"].map((key) => (
              <div key={key} className="rounded-xl overflow-hidden">
                <Skeleton className="aspect-square w-full" />
                <div className="p-4 flex flex-col gap-2">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-9 w-full mt-2" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div
            className="flex flex-col items-center gap-4 py-16 text-center"
            data-ocid="bestsellers.empty_state"
          >
            <span className="text-5xl">🌱</span>
            <p className="font-serif text-lg text-foreground">
              nothing here yet~ check back soon!
            </p>
            <p className="text-sm text-muted-foreground">
              we're busy crafting something cute for this category 🪡
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredProducts.map((product, i) => (
              <ProductCard
                key={product.id}
                product={product}
                index={i}
                onOrder={onOrder}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function CustomisationBanner() {
  return (
    <section className="py-14 px-4 bg-background">
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="rounded-2xl border-2 border-accent/40 bg-accent/10 px-8 py-10 text-center flex flex-col items-center gap-5"
        >
          <div className="flex items-center gap-2 text-accent">
            <Sparkles className="w-6 h-6" />
            <span className="font-serif text-lg font-bold text-accent">
              customisation available!
            </span>
            <Sparkles className="w-6 h-6" />
          </div>
          <p className="text-foreground text-base max-w-xl leading-relaxed">
            have something specific in mind? a name, a colour, a shape that's
            totally you? we'll make it <em>just</em> for you~ no small clay
            trinket too quirky, no request too cute 💛
          </p>
          <a
            href="https://www.instagram.com/claystories.in/"
            target="_blank"
            rel="noreferrer"
            data-ocid="customisation.primary_button"
          >
            <Button className="bg-accent hover:bg-accent/90 text-accent-foreground font-semibold px-7 py-5 text-base rounded-xl">
              <Instagram className="w-5 h-5 mr-2" />
              Request Custom Order
            </Button>
          </a>
        </motion.div>
      </div>
    </section>
  );
}

function AdminCategoryCard() {
  const { data: categories = [], isLoading } = useGetCategories();
  const addCategory = useAddCategory();
  const removeCategory = useRemoveCategory();

  const [catForm, setCatForm] = useState({
    name: "",
    emoji: "",
    description: "",
  });

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addCategory.mutateAsync(catForm);
      setCatForm({ name: "", emoji: "", description: "" });
      toast.success("category added! 🏷️");
    } catch {
      toast.error("couldn't add category, try again!");
    }
  };

  const handleRemoveCategory = async (id: string) => {
    try {
      await removeCategory.mutateAsync(id);
      toast.success("category removed!");
    } catch {
      toast.error("couldn't remove category, try again!");
    }
  };

  return (
    <div className="bg-card rounded-xl shadow-card p-6 mb-8 border border-accent/20">
      <div className="flex items-center gap-2 mb-5">
        <Tag className="w-5 h-5 text-accent" />
        <h2 className="font-serif text-xl font-semibold text-foreground">
          manage categories 🏷️
        </h2>
      </div>

      {/* Existing categories */}
      {isLoading ? (
        <div
          className="flex flex-col gap-2 mb-5"
          data-ocid="admin.loading_state"
        >
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-12 w-full rounded-lg" />
          ))}
        </div>
      ) : categories.length === 0 ? (
        <p
          className="text-muted-foreground text-sm mb-5"
          data-ocid="admin.empty_state"
        >
          no categories yet~ add one below!
        </p>
      ) : (
        <div className="flex flex-col gap-2 mb-5">
          {categories.map((cat, i) => (
            <div
              key={cat.id}
              className="flex items-center justify-between px-4 py-3 rounded-lg border border-border bg-background"
              data-ocid={`admin.item.${i + 1}`}
            >
              <div className="flex items-center gap-2">
                <span className="text-xl">{cat.emoji}</span>
                <div>
                  <p className="font-medium text-foreground text-sm">
                    {cat.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {cat.description}
                  </p>
                </div>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => handleRemoveCategory(cat.id)}
                disabled={removeCategory.isPending}
                className="h-8 w-8 p-0 text-destructive hover:bg-destructive/10 hover:text-destructive"
                data-ocid={`admin.delete_button.${i + 1}`}
                aria-label={`Remove ${cat.name}`}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Add category form */}
      <form
        onSubmit={handleAddCategory}
        className="flex flex-col gap-3 border-t border-border pt-4"
      >
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          add new category
        </p>
        <div className="grid grid-cols-3 gap-3">
          <div className="col-span-2 flex flex-col gap-1">
            <Label htmlFor="cat-name">name *</Label>
            <Input
              id="cat-name"
              value={catForm.name}
              onChange={(e) =>
                setCatForm((p) => ({ ...p, name: e.target.value }))
              }
              placeholder="e.g. Clay Charms"
              required
              data-ocid="admin.input"
            />
          </div>
          <div className="flex flex-col gap-1">
            <Label htmlFor="cat-emoji">emoji *</Label>
            <Input
              id="cat-emoji"
              value={catForm.emoji}
              onChange={(e) =>
                setCatForm((p) => ({ ...p, emoji: e.target.value }))
              }
              placeholder="e.g. 🧸"
              required
              data-ocid="admin.input"
            />
          </div>
        </div>
        <div className="flex flex-col gap-1">
          <Label htmlFor="cat-desc">description</Label>
          <Textarea
            id="cat-desc"
            value={catForm.description}
            onChange={(e) =>
              setCatForm((p) => ({ ...p, description: e.target.value }))
            }
            placeholder="a short description of this category~"
            rows={2}
            data-ocid="admin.textarea"
          />
        </div>
        <Button
          type="submit"
          disabled={addCategory.isPending}
          className="w-fit bg-accent hover:bg-accent/90 text-accent-foreground"
          data-ocid="admin.submit_button"
        >
          {addCategory.isPending ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" /> adding...
            </>
          ) : (
            "add category 🏷️"
          )}
        </Button>
      </form>
    </div>
  );
}

function AdminPanel() {
  const { data: products = [], isLoading } = useGetAllProducts();
  const { data: categoriesData = [] } = useGetCategories();
  const { data: paymentSettings } = useGetPaymentSettings();
  const addProduct = useAddProduct();
  const updateStock = useUpdateProductStock();
  const setPaymentSettings = useSetPaymentSettings();

  const categories =
    categoriesData.length > 0 ? categoriesData : FALLBACK_CATEGORIES;

  const [productForm, setProductForm] = useState({
    name: "",
    description: "",
    priceINR: "",
    category: "",
  });

  const [paymentForm, setPaymentForm] = useState({
    upiId: "",
    instructions: "",
  });

  useEffect(() => {
    if (paymentSettings) {
      setPaymentForm({
        upiId: paymentSettings.upiId || "",
        instructions: paymentSettings.instructions || "",
      });
    }
  }, [paymentSettings]);

  const handleSavePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await setPaymentSettings.mutateAsync({
        upiId: paymentForm.upiId,
        instructions: paymentForm.instructions,
      });
      toast.success("payment settings saved! 💳");
    } catch {
      toast.error("couldn't save payment settings, try again!");
    }
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addProduct.mutateAsync({
        name: productForm.name,
        description: productForm.description,
        priceINR: Number(productForm.priceINR),
        category: productForm.category,
      });
      setProductForm({ name: "", description: "", priceINR: "", category: "" });
      toast.success("product added! 🎉");
    } catch {
      toast.error("couldn't add product, try again!");
    }
  };

  return (
    <div className="min-h-screen bg-background px-4 py-10">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <img
            src="/assets/uploads/unnamed-1.jpg"
            alt="Clay Stories"
            className="h-10 w-10 object-cover rounded-full"
          />
          <div>
            <h1 className="font-serif text-2xl font-bold text-foreground">
              admin panel 🔒
            </h1>
            <p className="text-xs text-muted-foreground">
              for your eyes only~ (add #admin to URL to access)
            </p>
          </div>
        </div>

        {/* Payment Settings Card */}
        <div className="bg-card rounded-xl shadow-card p-6 mb-8 border border-primary/20">
          <div className="flex items-center gap-2 mb-5">
            <CreditCard className="w-5 h-5 text-primary" />
            <h2 className="font-serif text-xl font-semibold text-foreground">
              payment settings 💳
            </h2>
          </div>
          <div className="mb-4 rounded-lg border border-destructive/30 bg-destructive/6 px-4 py-3 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-destructive shrink-0" />
            <p className="text-sm text-destructive font-medium">
              no cash on delivery accepted -- set up your UPI details below
            </p>
          </div>
          <form onSubmit={handleSavePayment} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="payment-upi">UPI ID *</Label>
              <Input
                id="payment-upi"
                value={paymentForm.upiId}
                onChange={(e) =>
                  setPaymentForm((p) => ({ ...p, upiId: e.target.value }))
                }
                placeholder="yourname@upi"
                required
                data-ocid="admin.input"
              />
              <p className="text-xs text-muted-foreground">
                this will be shown to customers when they place an order
              </p>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="payment-instructions">payment instructions</Label>
              <Textarea
                id="payment-instructions"
                value={paymentForm.instructions}
                onChange={(e) =>
                  setPaymentForm((p) => ({
                    ...p,
                    instructions: e.target.value,
                  }))
                }
                placeholder="e.g. please pay via UPI and share your UTR/transaction ID with us 💌"
                rows={3}
                data-ocid="admin.textarea"
              />
            </div>
            <Button
              type="submit"
              disabled={setPaymentSettings.isPending}
              className="w-fit bg-primary hover:bg-primary/90 text-primary-foreground"
              data-ocid="admin.save_button"
            >
              {setPaymentSettings.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" /> saving...
                </>
              ) : (
                "save payment settings 💾"
              )}
            </Button>
          </form>
        </div>

        {/* Category Management Card */}
        <AdminCategoryCard />

        {/* Add Product Form */}
        <div className="bg-card rounded-xl shadow-card p-6 mb-8">
          <h2 className="font-serif text-xl font-semibold text-foreground mb-5">
            add a new trinket ✨
          </h2>
          <form onSubmit={handleAddProduct} className="flex flex-col gap-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="admin-name">trinket name *</Label>
                <Input
                  id="admin-name"
                  value={productForm.name}
                  onChange={(e) =>
                    setProductForm((p) => ({ ...p, name: e.target.value }))
                  }
                  placeholder="e.g. Rainbow Heart"
                  required
                  data-ocid="admin.input"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="admin-category">category *</Label>
                {categories.length > 0 ? (
                  <select
                    id="admin-category"
                    value={productForm.category}
                    onChange={(e) =>
                      setProductForm((p) => ({
                        ...p,
                        category: e.target.value,
                      }))
                    }
                    required
                    data-ocid="admin.select"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="">select a category~</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={nameToSlug(cat.name)}>
                        {cat.emoji} {cat.name}
                      </option>
                    ))}
                  </select>
                ) : (
                  <Input
                    id="admin-category"
                    value={productForm.category}
                    onChange={(e) =>
                      setProductForm((p) => ({
                        ...p,
                        category: e.target.value,
                      }))
                    }
                    placeholder="e.g. clay-charms"
                    required
                    data-ocid="admin.input"
                  />
                )}
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="admin-desc">description *</Label>
              <Textarea
                id="admin-desc"
                value={productForm.description}
                onChange={(e) =>
                  setProductForm((p) => ({ ...p, description: e.target.value }))
                }
                placeholder="a cute lil' description~"
                rows={2}
                required
                data-ocid="admin.textarea"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="admin-price">price (₹) *</Label>
              <Input
                id="admin-price"
                value={productForm.priceINR}
                onChange={(e) =>
                  setProductForm((p) => ({ ...p, priceINR: e.target.value }))
                }
                type="number"
                min={1}
                placeholder="249"
                required
                data-ocid="admin.input"
              />
            </div>
            <Button
              type="submit"
              disabled={addProduct.isPending}
              className="w-fit bg-primary hover:bg-primary/90 text-primary-foreground"
              data-ocid="admin.submit_button"
            >
              {addProduct.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" /> adding...
                </>
              ) : (
                "add trinket ✨"
              )}
            </Button>
          </form>
        </div>

        {/* Products List */}
        <div className="bg-card rounded-xl shadow-card p-6">
          <h2 className="font-serif text-xl font-semibold text-foreground mb-5">
            all trinkets 🌿
          </h2>
          {isLoading ? (
            <div
              className="flex flex-col gap-3"
              data-ocid="admin.loading_state"
            >
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-16 w-full rounded-lg" />
              ))}
            </div>
          ) : products.length === 0 ? (
            <p
              className="text-muted-foreground text-sm"
              data-ocid="admin.empty_state"
            >
              no trinkets yet~ add one above!
            </p>
          ) : (
            <div className="flex flex-col gap-3">
              {products.map((product, i) => (
                <div
                  key={product.id}
                  className="flex items-center justify-between p-4 rounded-lg border border-border bg-background"
                  data-ocid={`admin.item.${i + 1}`}
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground text-sm truncate">
                      {product.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      ₹{product.priceINR} · {product.category}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 ml-4">
                    <span className="text-xs text-muted-foreground">
                      {product.inStock ? "in stock" : "out of stock"}
                    </span>
                    <Switch
                      checked={product.inStock}
                      onCheckedChange={(checked) => {
                        updateStock.mutate({
                          id: product.id,
                          inStock: checked,
                        });
                      }}
                      data-ocid="admin.switch"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function NavCategoryDropdown({
  activeCategory,
  onCategoryChange,
}: {
  activeCategory: string | null;
  onCategoryChange: (id: string | null) => void;
}) {
  const { data } = useGetCategories();
  const categories = data && data.length > 0 ? data : FALLBACK_CATEGORIES;
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node))
        setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const active = categories.find((c) => c.id === activeCategory);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1 text-sm font-medium text-foreground/70 hover:text-primary transition-colors py-1"
        data-ocid="nav.dropdown_menu"
      >
        {active ? `${active.emoji} ${active.name}` : "Shop"}
        <svg
          aria-hidden="true"
          className={`w-3 h-3 transition-transform ${open ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>
      {open && (
        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 bg-background border border-border rounded-lg shadow-lg py-1 z-50 min-w-[160px]">
          <button
            type="button"
            className={`w-full text-left px-4 py-2 text-sm hover:bg-primary/10 transition-colors ${activeCategory === null ? "text-primary font-medium" : "text-foreground/70"}`}
            onClick={() => {
              onCategoryChange(null);
              setOpen(false);
            }}
            data-ocid="nav.tab"
          >
            ✨ All
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              className={`w-full text-left px-4 py-2 text-sm hover:bg-primary/10 transition-colors ${activeCategory === cat.id ? "text-primary font-medium" : "text-foreground/70"}`}
              onClick={() => {
                onCategoryChange(cat.id);
                setOpen(false);
              }}
              data-ocid="nav.tab"
            >
              {cat.emoji} {cat.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function ClayStoriesApp() {
  const bestsellersRef = useRef<HTMLElement>(null);
  const [orderProduct, setOrderProduct] = useState<Product | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  useEffect(() => {
    const checkHash = () => setIsAdmin(window.location.hash === "#admin");
    checkHash();
    window.addEventListener("hashchange", checkHash);
    return () => window.removeEventListener("hashchange", checkHash);
  }, []);

  const handleOrder = (p: Product) => {
    setOrderProduct(p);
    setModalOpen(true);
  };

  const scrollToBestsellers = () => {
    bestsellersRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  if (isAdmin) {
    return (
      <>
        <AdminPanel />
        <Toaster />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Announcement Bar */}
      <div className="bg-announcement text-white text-center py-2 px-4 text-xs sm:text-sm font-medium tracking-wide">
        free shipping on orders above ₹199 · each small clay trinket is
        hand-shaped with love 🌿
      </div>

      {/* Header */}
      <header className="bg-background border-b border-border px-4 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="w-16 hidden sm:block" />
          <div className="text-center flex-1 flex justify-center">
            <a href="/" aria-label="Clay Stories home">
              <img
                src="/assets/uploads/unnamed-1.jpg"
                alt="Clay Stories"
                className="h-16 w-16 object-cover rounded-full"
              />
            </a>
          </div>
          <div className="flex items-center gap-3 w-16 justify-end">
            <button
              type="button"
              aria-label="Shopping bag"
              className="relative"
              data-ocid="header.button"
            >
              <ShoppingBag className="w-5 h-5 text-foreground" />
            </button>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav
        className="bg-background border-b border-border px-4 py-2"
        aria-label="Primary navigation"
      >
        <div className="max-w-6xl mx-auto flex items-center justify-center gap-6 sm:gap-8">
          <a
            href="#home"
            className="text-sm font-medium text-foreground/70 hover:text-primary transition-colors py-1"
            data-ocid="nav.link"
          >
            Home
          </a>
          <a
            href="#bestsellers"
            className="text-sm font-medium text-foreground/70 hover:text-primary transition-colors py-1"
            data-ocid="nav.link"
          >
            Bestsellers
          </a>
          {/* Shop / Categories dropdown */}
          <NavCategoryDropdown
            activeCategory={activeCategory}
            onCategoryChange={(id) => {
              setActiveCategory(id);
              setTimeout(
                () =>
                  bestsellersRef.current?.scrollIntoView({
                    behavior: "smooth",
                  }),
                50,
              );
            }}
          />
          <a
            href="#about"
            className="text-sm font-medium text-foreground/70 hover:text-primary transition-colors py-1"
            data-ocid="nav.link"
          >
            About
          </a>
          <a
            href="#contact"
            className="text-sm font-medium text-foreground/70 hover:text-primary transition-colors py-1"
            data-ocid="nav.link"
          >
            Contact
          </a>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-6xl mx-auto px-4 py-12 sm:py-20">
        <div className="grid md:grid-cols-2 gap-10 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="rounded-2xl overflow-hidden shadow-card">
              <img
                src="/assets/generated/hero-charms.dim_900x600.jpg"
                alt="Handcrafted small clay trinkets collection"
                className="w-full h-full object-cover"
              />
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="flex flex-col gap-5"
          >
            <h2 className="font-serif text-4xl sm:text-5xl font-bold text-foreground leading-tight">
              tiny trinkets. big feelings. 🌿
            </h2>
            <p className="text-muted-foreground text-base leading-relaxed">
              every little piece is hand-shaped with love and a little bit of
              magic. no two are exactly the same, just like you~
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                onClick={scrollToBestsellers}
                className="w-fit bg-primary hover:bg-primary/90 text-primary-foreground px-7 py-5 text-base font-medium rounded-lg shadow-xs"
                data-ocid="hero.primary_button"
              >
                Shop Bestsellers 🛍️
              </Button>
              <a
                href="https://www.instagram.com/claystories.in/"
                target="_blank"
                rel="noreferrer"
                data-ocid="hero.secondary_button"
              >
                <Button
                  variant="outline"
                  className="w-fit border-primary text-primary hover:bg-primary/10 px-7 py-5 text-base font-medium rounded-lg"
                >
                  <Instagram className="w-4 h-4 mr-2" />
                  Custom Order
                </Button>
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Bestsellers Section */}
      <section ref={bestsellersRef as React.RefObject<HTMLElement>}>
        <BestsellersSection
          onOrder={handleOrder}
          activeCategory={activeCategory}
        />
      </section>

      {/* Customisation Banner */}
      <CustomisationBanner />

      {/* About Section */}
      <section id="about" className="py-16 px-4 bg-section-band">
        <div className="max-w-2xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="font-serif text-3xl font-bold text-foreground mb-4">
              our lil' story 🌿
            </h2>
            <p className="text-muted-foreground leading-relaxed text-base">
              we're a small home studio creating handmade small clay trinkets,
              each one shaped by hand with love, a little music, and probably
              too much coffee ☕. hearts filled with warmth, worry stones to
              hold close when the world feels big, every piece is a tiny world
              of its own, waiting to become part of yours.
            </p>
            <p className="text-muted-foreground leading-relaxed text-base mt-4">
              ✨ customisation is available! have something specific in mind?
              slide into our DMs to request your dream piece, we love making
              one-of-a-kind small clay trinkets just for you 💌
            </p>
          </motion.div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-14 px-4 bg-background">
        <div className="max-w-xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="font-serif text-2xl font-bold text-foreground mb-3">
              say hello! 👋
            </h2>
            <p className="text-muted-foreground text-sm mb-5">
              DM us for custom orders, queries, or just to say hi! 💌
            </p>
            <a
              href="https://www.instagram.com/claystories.in/"
              target="_blank"
              rel="noreferrer"
              data-ocid="contact.primary_button"
            >
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-5 text-base font-semibold rounded-xl">
                <Instagram className="w-5 h-5 mr-2" />
                @claystories.in on Instagram
              </Button>
            </a>
            <p className="text-xs text-muted-foreground mt-4">
              say hello on Instagram!
            </p>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-footer text-white px-4 py-10">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="text-center sm:text-left">
              <img
                src="/assets/uploads/unnamed-1.jpg"
                alt="Clay Stories"
                className="h-12 w-12 object-cover rounded-full brightness-[1.2]"
              />
            </div>
            <nav className="flex gap-5" aria-label="Footer navigation">
              {["Home", "Bestsellers", "About", "Contact"].map((label) => (
                <a
                  key={label}
                  href={`#${label.toLowerCase()}`}
                  className="text-white/80 hover:text-white text-sm transition-colors"
                  data-ocid="footer.link"
                >
                  {label}
                </a>
              ))}
            </nav>
          </div>
          <div className="border-t border-white/20 mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-white/60 text-xs">
              © {new Date().getFullYear()} claystories.in · made with{" "}
              <span aria-label="love">♥</span> &nbsp;·&nbsp; Built with love
              using{" "}
              <a
                href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(typeof window !== "undefined" ? window.location.hostname : "")}`}
                className="underline hover:text-white transition-colors"
                target="_blank"
                rel="noreferrer"
              >
                caffeine.ai
              </a>
            </p>
            <a
              href="https://www.instagram.com/claystories.in/"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 text-white/70 hover:text-white text-sm transition-colors"
              data-ocid="footer.link"
            >
              <Instagram className="w-4 h-4" />
              @claystories.in
            </a>
          </div>
        </div>
      </footer>

      {/* Order Modal */}
      <AnimatePresence>
        {modalOpen && (
          <OrderModal
            product={orderProduct}
            open={modalOpen}
            onClose={() => setModalOpen(false)}
          />
        )}
      </AnimatePresence>

      <Toaster />
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ClayStoriesApp />
    </QueryClientProvider>
  );
}
