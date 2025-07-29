"use client"
import React, { useState, useEffect } from 'react';
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import toast from 'react-hot-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../ui/dialog";
import { Copy, QrCode } from "lucide-react";
import ProductQrModal from "./ProductQrModal";
import { Switch } from "../ui/switch";
import { Label } from "../ui/label";


const ProductProfile = ({ id }) => {
    const [title, setTitle] = useState("");
    const [code, setCode] = useState(""); // Will be auto-generated
    const [loading, setLoading] = useState(false);
    const [refreshTable, setRefreshTable] = useState(false);
    // For inline editing
    const [editingId, setEditingId] = useState(null);

    // QR Modal state  
    const [qrModalCode, setQrModalCode] = useState('');
    const [qrModalOpen, setQrModalOpen] = useState(false);
    const [qrModalUrl, setQrModalUrl] = useState("");
    const [qrModalTitle, setQrModalTitle] = useState("");
    const [qrModalSizes, setQrModalSizes] = useState([]);
    const [qrModalColors, setQrModalColors] = useState([]);
    const [qrModalPrice, setQrModalPrice] = useState('');
    const [qrModalOldPrice, setQrModalOldPrice] = useState('');
    const [qrModalDescription, setQrModalDescription] = useState('');
    const [qrModalCoupon, setQrModalCoupon] = useState({ code: '', amount: 0 });


    // Generate product code on mount
    useEffect(() => {
        const generateCode = () => {
            const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
            let code = "";
            for (let i = 0; i < 6; i++) {
                code += chars[Math.floor(Math.random() * chars.length)];
            }
            return code;
        };
        setCode(generateCode());
    }, []);

    // Slugify utility
    function slugify(str) {
        return str
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '')
            .replace(/-+/g, '-');
    }
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!title.trim()) return toast.error('Title cannot be empty');
        // Always create direct product
        let payload = { title, code, slug: slugify(title), isDirect: true };
        const res = await fetch('/api/product', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        if (res.ok) {
            const newProduct = await res.json();
            setTitle(""); setCode("");
            setRefreshTable(r => !r);
            toast.success('Direct product saved!');
        } else {
            const err = await res.json();
            toast.error('Failed to save product: ' + (err.error || 'Unknown error'));
        }
    };

    const [products, setProducts] = useState([]);
    useEffect(() => {
        fetch('/api/product?isDirect=true')
            .then(res => res.json())
            .then(data => setProducts(Array.isArray(data) ? data : []));
    }, [refreshTable]);

    // Modal state for deletion
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState(null);

    const handleDelete = (id) => {
        setDeleteTarget(id);
        setShowDeleteModal(true);
    };

    const cancelDelete = () => {
        setShowDeleteModal(false);
        setDeleteTarget(null);
    };

    const confirmDelete = async () => {
        if (!deleteTarget) return;
        const res = await fetch(`/api/product/${deleteTarget}`, { method: 'DELETE' });
        if (res.ok) {
            setProducts(products => products.filter(p => p._id !== deleteTarget));
            toast.success('Product deleted successfully');
        } else {
            const err = await res.json().catch(() => ({}));
            toast.error('Failed to delete product: ' + (err.error || 'Unknown error'));
        }
        setShowDeleteModal(false);
        setDeleteTarget(null);
    };



    // Copy to clipboard helper
    function copyToClipboard(text) {
        navigator.clipboard.writeText(text);
        toast.success('URL copied!');
    }
    // Toggle product active status for direct products
    const toggleSwitch = async (productId, currentActive, isDirect) => {
        if (!isDirect) {
            toast.error('Only direct products can be toggled.');
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

    return (
        <>
            <form className="flex flex-col items-center justify-center gap-8 my-20 bg-gray-200 w-full max-w-xl md:max-w-3xl mx-auto p-4 rounded-lg" onSubmit={async e => {
                e.preventDefault();
                if (!title.trim()) return toast.error('Title cannot be empty');
      
                if (editingId) {
                    // Update mode
                    const res = await fetch(`/api/product/${encodeURIComponent(title)}`, {
                        method: 'PATCH',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ title })
                    });
                    if (res.ok) {
                        const updated = await res.json();
                        setProducts(ps => ps.map(p => p._id === editingId ? { ...p, title: updated.title } : p));
                        setEditingId(null);
                        setTitle("");
                
                        toast.success('Product updated!');
                    } else {
                        let err;
                        try {
                            err = await res.json();
                        } catch {
                            err = { error: 'Failed to update' };
                        }
                        toast.error(err.error || 'Failed to update');
                    }
                }
                else {
                    // Create mode
                    const createdProduct = await handleSubmit(e);
                    // If product created and subMenuId exists, link product to submenu
                    if (createdProduct && subMenuId) {
                        // console.log('Linking product to submenu:', createdProduct._id, subMenuId);
                        await fetch('/api/linkProductToSubMenu', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ subMenuId, productId: createdProduct._id })
                        });
                        // Refetch submenu/products to update table
                        await fetchSubMenuItems();
                    }
                }
            }}>
                <div className="flex md:flex-row flex-col items-center gap-6 w-full">
                    <div className="flex flex-col gap-2 w-full">
                        <label htmlFor="productCode" className="font-semibold">Product Code</label>
                        <Input name="productCode" className="w-full border-2 font-bold border-blue-600 focus:border-dashed focus:border-blue-500 focus:outline-none focus-visible:ring-0 bg-gray-100" placeholder="Pre Fix" value={code} readOnly />
                    </div>
                    <div className="flex flex-col gap-2 w-full">
                        <label htmlFor="productTitle" className="font-semibold">Product Title</label>
                        <Input name="productTitle" className="w-full border-2 font-bold border-blue-600 focus:border-dashed focus:border-blue-500 focus:outline-none focus-visible:ring-0" placeholder="Type Here:" value={title} onChange={e => setTitle(e.target.value)} />
                    </div>
                </div>
                {editingId ? (
                    <div className="flex gap-4 mt-4">
                        <Button type="submit" className="bg-green-600">Update</Button>
                        <Button type="button" className="bg-gray-400" onClick={() => { setEditingId(null); setTitle("");}}>Cancel</Button>
                    </div>
                ) : (
                    <Button type="submit" className="bg-red-500">Save Product</Button>
                )}
            </form>
            {/* Product Table copied inline */}
            <div className="mt-10 flex flex-col items-center">
                <h3 className="text-xl font-semibold mb-4">Product List</h3>
                <table className="w-full border border-black rounded-lg">
                    <thead>
                        <tr className="bg-gray-200">
                            <th className="py-2 px-4 text-center">Title</th>
          
                            <th className="py-2 px-4 text-center">URL</th>
                            <th className="py-2 px-4 text-center">QR</th>
                            <th className="py-2 px-4 text-center">Active</th>
                            <th className="py-2 px-4 text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {products.map((prod, idx) => (
                            <tr key={prod._id} className="border-t">
                                <td className="py-2 px-4 text-center">{prod.title}</td>
                               
                                {/* <td className="py-2 px-4 text-center">{prod.code}</td> */}
                                {/* <td className="py-2 px-4 text-center">
                                    <div className="flex flex-col items-center">
                                        <span>{prod.title}</span>
                                    </div>
                                </td> */}
                                <td className="py-2 px-4 text-center">
                                    {/* Product URL Copy Button Only */}
                                    {prod.title && (() => {
                                        const url = `${window.location.origin}/product/${slugify(prod.slug)}`;
                                        return (
                                            <Button
                                                size="icon"
                                                variant="ghost"
                                                onClick={() => copyToClipboard(url)}
                                                disabled={!url}
                                                title="Copy Product URL"
                                            >
                                                <Copy className="w-4 h-4" />
                                            </Button>
                                        );
                                    })()}
                                </td>
                                <td className="py-2 px-4 text-center">
                                    {/* Product QR Copy/View Button */}
                                    {prod.title && (() => {
                                        const qr = `${window.location.origin}/product/${slugify(prod.slug)}`;
                                        return (
                                            <div className="flex gap-2 justify-center">
                                                <Button
                                                    size="icon"
                                                    variant="ghost"
                                                    onClick={() => {
                                                        setQrModalUrl(qr);
                                                        setQrModalTitle(prod.title);
                                                        setQrModalCode(prod.code);
                                                        setQrModalDescription(prod.description?.overview || '');
                                                        
                                                        // Safely handle variants
                                                        const variants = prod.quantity?.variants || [];
                                                        const allSizes = Array.from(new Set(variants.map(v => v?.size).filter(Boolean)));
                                                        const allColors = Array.from(new Set(variants.map(v => v?.color).filter(Boolean)));
                                                        setQrModalSizes(allSizes);
                                                        setQrModalColors(allColors);
                                                        
                                                        // Coupon logic with safe access
                                                        let basePrice = variants[0]?.price ?? '';
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
                                        );
                                    })()}
                                </td>
                                <td className="py-2 px-4 text-center">
                                    <div className="flex flex-col items-center gap-1">
                                        <Switch
                                            id={`switch-${prod._id}`}
                                            checked={prod.active}
                                            onCheckedChange={() => toggleSwitch(prod._id, prod.active, prod.isDirect)}
                                            className={`rounded-full transition-colors ${prod.active ? "!bg-green-500" : "!bg-red-500"}`}
                                            disabled={!prod.isDirect}
                                        />
                                        <Label htmlFor={`switch-${prod._id}`} className="text-black text-xs">
                                            {prod.active ? "ON" : "OFF"}
                                        </Label>
                                    </div>
                                </td>
                                <td className="py-2 px-4">
                                    <div className="flex gap-2 justify-center">
                                        <button
                                            className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-800"
                                            onClick={() => window.location.href = `/admin/add_direct_product/${prod._id}`}
                                        >
                                            Add Info
                                        </button>
                                        <button
                                            className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-800"
                                            onClick={() => {
                                                setEditingId(prod._id);
                                                setTitle(prod.title);
                                                
                                            }}
                                        >
                                            Edit
                                        </button>
                                        <button
                                            className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-800 flex items-center gap-2"
                                            onClick={() => handleDelete(prod._id)}
                                            disabled={deleteTarget === prod._id && loading}
                                        >
                                            Delete
                                            {deleteTarget === prod._id && loading && (
                                                <span className="ml-2 w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin inline-block"></span>
                                            )}
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
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

            {/* Delete Product Modal */}
            <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Product</DialogTitle>
                    </DialogHeader>
                    <p>Are you sure you want to delete this product?</p>
                    <DialogFooter>
                        <Button variant="secondary" onClick={cancelDelete}>Cancel</Button>
                        <Button variant="destructive" onClick={confirmDelete}>Delete</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}

export default ProductProfile;
