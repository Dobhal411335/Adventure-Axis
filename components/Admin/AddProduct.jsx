'use client'

import { useForm } from "react-hook-form"
import { Input } from "../ui/input"
import { NumericFormat } from "react-number-format"
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import { Button } from "../ui/button"
import { useEffect, useState } from "react"
import toast from "react-hot-toast"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import Link from "next/link"
import { Loader2, Pencil, Trash2, QrCode, Copy } from "lucide-react"
import { Switch } from "../ui/switch"
import { Label } from "../ui/label"
import ProductQrModal from "./ProductQrModal";
import { useRef } from "react";

const generateCode = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let code = "";
    for (let i = 0; i < 6; i++) {
        code += chars[Math.floor(Math.random() * chars.length)];
    }
    return code;
};
const AddProduct = ({ id }) => {
    // ...existing state
    const [allCategories, setAllCategories] = useState([]);
    // ...existing state and hooks...

    // Editing state
    const [isEditing, setIsEditing] = useState(false);

    // Scroll ref for form
    const formRef = useRef(null);

    // Handler to fill form for editing
    const handleEditProduct = (prod) => {
        // Use react-hook-form's reset to fill all fields
        reset({
            title: prod.title || '',
            order: prod.order || 1,
            active: typeof prod.active === 'boolean' ? prod.active : true,
            // Add other fields as needed
        });
        setProductCode(prod.code || '');
        setActive(typeof prod.active === 'boolean' ? prod.active : true);
        setOrder(prod.order || 1);
        setTitle(prod.title || '');
        setIsEditing(true);
        // Optionally scroll to form
        if (formRef.current) {
            formRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    };

    // Cancel edit handler
    const handleCancelEdit = () => {
        reset({
            title: '',
            order: 1,
            active: true,
            // Add other fields as needed
        });
        setProductCode(generateCode());
        setActive(true);
        setOrder(1);
        setTitle('');
        setIsEditing(false);
    };


    // QR Modal state
    const [qrModalOpen, setQrModalOpen] = useState(false);
    const [qrModalUrl, setQrModalUrl] = useState("");
    const [qrModalTitle, setQrModalTitle] = useState("");

    function slugify(str) {
        if (!str) return ''; // Return empty string if str is undefined, null, or empty
        return String(str)
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '')
            .replace(/-+/g, '-');
    }
    // Copy to clipboard helper
    function copyToClipboard(text) {
        navigator.clipboard.writeText(text);
        toast.success('URL copied!');
    }

    // Toggle product active status
    const toggleSwitch = async (productId, currentActive, isDirect) => {
        if (isDirect) {
            toast.error('Only non-direct products can be toggled.');
            return;
        }
        try {
            const response = await fetch('/api/admin/website-manage/addPackage', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ pkgId: productId, active: !currentActive }),
            });
            const result = await response.json();
            if (response.ok) {
                setProducts(prev => prev.map(prod => prod._id === productId ? { ...prod, active: !currentActive } : prod));
                toast.success(`Product is now ${!currentActive ? 'active' : 'inactive'}`);
            } else {
                toast.error(result.message || 'Failed to update product status.');
            }
        } catch (error) {
            toast.error('Failed to update product status.');
        }
    }

    const { handleSubmit, register, setValue, reset } = useForm();
    const subMenuId = id;
    const [productCode, setProductCode] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [title, setTitle] = useState("");
    const [order, setOrder] = useState(1);
    const [active, setActive] = useState(true);
    const [qrModalCode, setQrModalCode] = useState('');
    const [qrModalCategory, setQrModalCategory] = useState('');
    const [qrModalSizes, setQrModalSizes] = useState([]);
    const [qrModalColors, setQrModalColors] = useState([]);
    const [qrModalPrice, setQrModalPrice] = useState('');
    const [qrModalOldPrice, setQrModalOldPrice] = useState('');
    const [qrModalDescription, setQrModalDescription] = useState('');
    const [qrModalCoupon, setQrModalCoupon] = useState({ code: '', amount: 0 });


    useEffect(() => {
        setProductCode(generateCode());
    }, []);

    useEffect(() => {
        // Fetch products for this submenu/category or all direct products
        const fetchProducts = async () => {
            try {
                let url = '';
                if (subMenuId) {
                    url = `/api/getSubMenuById/${subMenuId}`;
                }
                const response = await fetch(url);
                const data = await response.json();
                // console.log(data)
                if (subMenuId && Array.isArray(data.products)) {
                    setProducts(data.products);
                } else if (!subMenuId && Array.isArray(data)) {
                    setProducts(data);
                } else {
                    setProducts([]);
                }
            } catch (error) {
                setProducts([]);
            }
        };
        fetchProducts();
    }, [subMenuId]);
    const deletePackage = async (id) => {
        setIsLoading(true);
        try {
            const response = await fetch('/api/admin/website-manage/addPackage', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id }),
            });
            const result = await response.json();
            if (response.ok) {
                setProducts((prev) => prev.filter((prod) => prod._id !== id));
                toast.success('Product deleted successfully!');
            } else {
                toast.error(result.message || 'Failed to delete product.');
            }
        } catch (error) {
            toast.error('Failed to delete product.');
        } finally {
            setIsLoading(false);
        }
    };
    const onSubmit = async () => {
        if (!title) {
            toast.error("All fields are required", { style: { borderRadius: "10px", border: "2px solid red" } });
            return;
        }

        setIsLoading(true);
        try {
            const payload = {
                title,
                slug: slugify(title),
                code: productCode,
                order,
                active: typeof active === 'boolean' ? active : true,
                isDirect: !subMenuId,
                ...(subMenuId ? { subMenuId, category: subMenuId } : {})
            };

            let response, result;
            if (isEditing) {
                response = await fetch('/api/admin/website-manage/addPackage', {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ code: productCode, ...payload })
                });
                result = await response.json();
                if (response.ok) {
                    toast.success('Product updated successfully!', { style: { borderRadius: "10px", border: "2px solid green" } });
                    // Reset form and state
                    reset({
                        title: '',
                    
                        order: 1,
                        active: true
                    });
                    setTitle('');
                
                    setOrder(1);
                    setActive(true);
                    setProductCode(generateCode());
                    setIsEditing(false);

                    // Refetch products
                    if (subMenuId) {
                        const res = await fetch(`/api/getSubMenuById/${subMenuId}`);
                        const data = await res.json();
                        if (Array.isArray(data.products)) {
                            setProducts(data.products);
                        }
                    } else {
                        const res = await fetch('/api/product?isDirect=true');
                        const data = await res.json();
                        if (Array.isArray(data)) {
                            setProducts(data);
                        }
                    }
                } else {
                    toast.error(result.message || 'Failed to update product', { style: { borderRadius: "10px", border: "2px solid red" } });
                }
            } else {
                response = await fetch('/api/admin/website-manage/addPackage', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
                result = await response.json();
                if (response.ok) {
                    toast.success('Product added successfully!', { style: { borderRadius: "10px", border: "2px solid green" } });
                    reset();
                    setTitle('');
                
                    setProductCode(generateCode());
                    // Refetch products
                    if (subMenuId) {
                        const res = await fetch(`/api/getSubMenuById/${subMenuId}`);
                        const data = await res.json();
                        if (Array.isArray(data.products)) {
                            setProducts(data.products);
                        }
                    } else {
                        const res = await fetch('/api/product?isDirect=true');
                        const data = await res.json();
                        if (Array.isArray(data)) {
                            setProducts(data);
                        }
                    }
                } else {
                    toast.error(result.message || 'Failed to add product', { style: { borderRadius: "10px", border: "2px solid red" } });
                }
            }
        } catch (error) {
            console.error('Error:', error);
            toast.error('Something went wrong', { style: { borderRadius: "10px", border: "2px solid red" } });
        } finally {
            setIsLoading(false);
        }
    };
    return (
        <>
            <form className="flex flex-col items-center justify-center gap-8 my-20 bg-gray-200 w-full md:w-fit mx-auto p-4 rounded-lg" onSubmit={handleSubmit(onSubmit)}>
                <div className="flex md:flex-row flex-col items-center md:items-end gap-6 w-full">
                    <div className="flex flex-col gap-2">
                        <label htmlFor="productCode" className="font-semibold">Product Code</label>
                        <Input name="productCode" className="w-full border-2 border-blue-600 focus:border-dashed focus:border-blue-500 focus:outline-none focus-visible:ring-0 font-bold" readOnly value={productCode} />
                    </div>
                    <div className="flex flex-col gap-2 ">
                        <label htmlFor="productTitle" className="font-semibold">Product Title</label>
                        <Input name="productTitle" className="w-full border-2 font-bold border-blue-600 " value={title} onChange={e => setTitle(e.target.value)} />
                    </div>
                
                </div>
                <Button type="submit" className="bg-red-600 hover:bg-red-500">Add Product</Button>
            </form>

            <div className="bg-blue-100 p-4 rounded-lg shadow max-w-5xl mx-auto w-full overflow-x-auto lg:overflow-visible text-center">
                <Table className="w-full min-w-max lg:min-w-0">
                    <TableHeader>
                        <TableRow>
                            <TableHead className="text-center !text-black w-1/6">Order</TableHead>
                            <TableHead className="text-center !text-black w-1/4">Product Name</TableHead>
                            <TableHead className="text-center !text-black w-1/6">URL</TableHead>
                            <TableHead className="text-center !text-black w-1/6">QR</TableHead>
                            <TableHead className="w-1/6 !text-black text-center">Action</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {products && products.length > 0 ? (
                            products.map((prod, index) => {
                                const url = typeof window !== 'undefined' ? `${window.location.origin}/product/${slugify(prod.slug)}` : '';
                                return (
                                    <TableRow key={prod._id}>
                                        <TableCell className="border font-semibold border-blue-600">{index + 1}</TableCell>
                                        <TableCell className="border font-semibold border-blue-600">{prod.title}</TableCell>
                                        <TableCell className="border font-semibold border-blue-600">
                                            <div className="flex items-center justify-center gap-2">
                                                {/* Copy URL Button */}
                                                <Button
                                                    size="icon"
                                                    variant="ghost"
                                                    onClick={() => copyToClipboard(url)}
                                                    disabled={!url}
                                                    title="Copy Product URL"
                                                >
                                                    <Copy className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                        <TableCell className="border font-semibold border-blue-600">
                                            <div className="flex items-center justify-center gap-2">
                                                {/* QR Code Button */}
                                                <Button
                                                    size="icon"
                                                    variant="ghost"
                                                    onClick={() => {
                                                        setQrModalUrl(url);
                                                        setQrModalTitle(prod.title);
                                                        setQrModalCode(prod.code);
                                                        setQrModalDescription(prod.description?.overview);
                                                        const allSizes = Array.from(new Set((prod.quantity?.variants || []).map(v => v.size)));
                                                        const allColors = Array.from(new Set((prod.quantity?.variants || []).map(v => v.color)));
                                                        setQrModalSizes(allSizes);
                                                        setQrModalColors(allColors);
                                                        // Coupon logic
                                                        let basePrice = prod.quantity.variants[0]?.price ?? '';
                                                        let oldPrice = prod.quantity.variants[0]?.oldPrice ?? '';
                                                        let discount = 0;
                                                        let couponCode = '';
                                                        if (prod.coupons && prod.coupons.coupon) {
                                                            discount = prod.coupons.coupon.amount || 0;
                                                            couponCode = prod.coupons.coupon.couponCode || '';
                                                        }
                                                        let discountedPrice = basePrice;
                                                        if (discount && basePrice) {
                                                            discountedPrice = basePrice - discount;
                                                        }
                                                        setQrModalPrice(discountedPrice);
                                                        setQrModalOldPrice(basePrice);
                                                        setQrModalCoupon({ code: couponCode, amount: discount });
                                                        setQrModalOpen(true);
                                                    }}
                                                    title="View QR & Download"
                                                >
                                                    <QrCode className="w-6 h-6" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                        <TableCell className="border font-semibold border-blue-600">
                                            <div className="flex items-center justify-center gap-6">
                                                <Button size="icon" variant="outline" asChild>
                                                    <Link href={`/admin/add_direct_product/${prod._id}`}>
                                                        Edit
                                                    </Link>
                                                </Button>
                                                <Button
                                                    size="icon"
                                                    variant="outline"
                                                    onClick={() => handleEditProduct(prod)}
                                                    title="Edit"
                                                >
                                                    <Pencil className="w-4 h-4" />
                                                </Button>
                                                <Button size="icon" disabled={isLoading} onClick={() => deletePackage(prod._id)} variant="destructive">
                                                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                                                </Button>
                                                <div className="flex items-center gap-2">
                                                    <Switch
                                                        id={`switch-${prod._id}`}
                                                        checked={prod.active}
                                                        onCheckedChange={() => toggleSwitch(prod._id, prod.active, prod.isDirect)}
                                                        className={`rounded-full transition-colors ${prod.active ? "!bg-green-500" : "!bg-red-500"}`}
                                                        disabled={prod.isDirect}
                                                    />
                                                    <Label htmlFor={`switch-${prod._id}`} className="text-black">
                                                        {prod.active ? "ON" : "OFF"}
                                                    </Label>
                                                </div>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                );
                            })
                        ) : (
                            <TableRow>
                                <TableCell colSpan="6" className="text-center border font-semibold border-blue-600">
                                    No packages available.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
            {/* QR Modal for viewing/downloading QR code */}
            <ProductQrModal
                open={qrModalOpen}
                onOpenChange={setQrModalOpen}
                qrUrl={qrModalUrl}
                productTitle={qrModalTitle}
                productDescription={qrModalDescription}
                productCode={qrModalCode}
                sizes={qrModalSizes}
                colors={qrModalColors}
                price={qrModalPrice}
                oldPrice={qrModalOldPrice}
                logoUrl="/logo.png"
                coupon={qrModalCoupon}
            />
        </>
    )

}
export default AddProduct
