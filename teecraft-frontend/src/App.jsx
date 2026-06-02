import { useEffect, useState, useRef } from "react"
import blackTee from "./assets/black-tee.png"
import whiteTee from "./assets/white-tee.png"
import navyTee from "./assets/navy-tee.png"
import redTee from "./assets/red-tee.png"
import greenTee from "./assets/green-tee.png"

function App() {
    const [products, setProducts] = useState([])
    const [selectedProduct, setSelectedProduct] = useState(null)

    const [cart, setCart] = useState(() => {
        const savedCart = localStorage.getItem("cart")
        return savedCart ? JSON.parse(savedCart) : []
    })

    const [showCart, setShowCart] = useState(false)
    const [showCheckout, setShowCheckout] = useState(false)
    const [showLogin, setShowLogin] = useState(false)
    const [showRegister, setShowRegister] = useState(false)

    const [customerName, setCustomerName] = useState("")
    const [customerEmail, setCustomerEmail] = useState("")
    const [customerAddress, setCustomerAddress] = useState("")

    const [searchTerm, setSearchTerm] = useState("")
    const [selectedColor, setSelectedColor] = useState("")
    const [selectedSize, setSelectedSize] = useState("")
    const [selectedVariantId, setSelectedVariantId] = useState("")

    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [firstName, setFirstName] = useState("")
    const [lastName, setLastName] = useState("")
    const [address, setAddress] = useState("")
    const [phoneNumber, setPhoneNumber] = useState("")

    const [orders, setOrders] = useState([])
    const [showOrders, setShowOrders] = useState(false)
    const [token, setToken] = useState(localStorage.getItem("token") || "")
    const [role, setRole] = useState(localStorage.getItem("role") || "")

    const [showAdminPanel, setShowAdminPanel] = useState(false)
    const [adminDashboard, setAdminDashboard] = useState(null)
    const [adminOrders, setAdminOrders] = useState([])
    const [orderHistories, setOrderHistories] = useState({})
    const [lowStockVariants, setLowStockVariants] = useState([])
    const [showLowStock, setShowLowStock] = useState(false)

    const [adminProducts, setAdminProducts] = useState([])
    const [showAdminProducts, setShowAdminProducts] = useState(false)

    const [editingProductId, setEditingProductId] = useState(null)
    const [editName, setEditName] = useState("")
    const [editDescription, setEditDescription] = useState("")
    const [editBasePrice, setEditBasePrice] = useState("")
    const [editImageUrl, setEditImageUrl] = useState("")
    const [editCategoryId, setEditCategoryId] = useState("")

    const [editingStockVariantId, setEditingStockVariantId] = useState(null)
    const [newStockQuantity, setNewStockQuantity] = useState("")
    const [productVariants, setProductVariants] = useState([])
    const [showVariants, setShowVariants] = useState(false)

    const homeRef = useRef(null)
    const productsRef = useRef(null)

    const [newName, setNewName] = useState("")
    const [newDescription, setNewDescription] = useState("")
    const [newBasePrice, setNewBasePrice] = useState("")
    const [newImageUrl, setNewImageUrl] = useState("")
    const [newCategoryId, setNewCategoryId] = useState("")

    const [variantProductId, setVariantProductId] = useState("")
    const [variantColor, setVariantColor] = useState("")
    const [variantSize, setVariantSize] = useState("")
    const [variantFit, setVariantFit] = useState("")
    const [variantStockQuantity, setVariantStockQuantity] = useState("")
    const [variantPrice, setVariantPrice] = useState("")

    useEffect(() => {
        fetchProducts()
    }, [])

    useEffect(() => {
        localStorage.setItem("cart", JSON.stringify(cart))
    }, [cart])

    function fetchProducts() {
        fetch("https://localhost:7042/api/Products?page=1&pageSize=10")
            .then(response => response.json())
            .then(data => {
                setProducts(data.items)
            })
    }

    const loginUser = async () => {
        const response = await fetch("https://localhost:7042/api/Auth/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                email,
                password
            })
        })

        if (!response.ok) {
            alert("Login failed")
            return
        }

        const data = await response.json()

        localStorage.setItem("token", data.token)
        setToken(data.token)

        const payload = JSON.parse(atob(data.token.split(".")[1]))
        const userRole = payload["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"]

        localStorage.setItem("role", userRole)
        setRole(userRole)

        alert("Login successful!")
        setShowLogin(false)
    }

    const registerUser = async () => {
        const response = await fetch("https://localhost:7042/api/Auth/register", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                email,
                password,
                firstName,
                lastName,
                address,
                phoneNumber
            })
        })

        if (!response.ok) {
            alert("Register failed")
            return
        }

        alert("User registered successfully!")
        setShowRegister(false)
        setShowLogin(true)
    }

    function logoutUser() {
        localStorage.removeItem("token")
        localStorage.removeItem("role")
        setToken("")
        setRole("")
        alert("Logged out")
    }

    async function addToCart(product) {
        if (!token) {
            alert("Please login before adding products to cart.")
            setShowLogin(true)
            return
        }

        const existingItem = cart.find(item =>
            item.productId === product.productId &&
            item.selectedVariant?.productVariantId === product.selectedVariant?.productVariantId
        )

        const currentQuantity = existingItem ? existingItem.quantity : 0

        if (product.selectedVariant.stockQuantity <= currentQuantity) {
            alert("Not enough stock available.")
            return
        }

        const response = await fetch("https://localhost:7042/api/Cart/items", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({
                productVariantId: product.selectedVariant.productVariantId,
                quantity: 1
            })
        })

        if (!response.ok) {
            alert("Could not add item to backend cart.")
            return
        }

        if (existingItem) {
            setCart(cart.map(item =>
                item.productId === product.productId &&
                    item.selectedVariant?.productVariantId === product.selectedVariant?.productVariantId
                    ? { ...item, quantity: item.quantity + 1 }
                    : item
            ))
        } else {
            setCart([...cart, { ...product, quantity: 1 }])
        }

        alert(product.name + " added to cart")
    }

    function removeFromCart(indexToRemove) {
        setCart(cart.filter((item, index) => index !== indexToRemove))
    }

    function increaseQuantity(productId, productVariantId) {
        setCart(cart.map(item => {
            if (
                item.productId === productId &&
                item.selectedVariant?.productVariantId === productVariantId
            ) {
                if (item.quantity >= item.selectedVariant.stockQuantity) {
                    alert("Not enough stock available.")
                    return item
                }

                return { ...item, quantity: item.quantity + 1 }
            }

            return item
        }))
    }

    function decreaseQuantity(productId, productVariantId) {
        setCart(cart
            .map(item =>
                item.productId === productId &&
                    item.selectedVariant?.productVariantId === productVariantId
                    ? { ...item, quantity: item.quantity - 1 }
                    : item
            )
            .filter(item => item.quantity > 0)
        )
    }

    const cartTotal = cart.reduce(
        (sum, item) => sum + (item.selectedVariant?.price ?? item.basePrice) * item.quantity,
        0
    )

    const selectedVariant = selectedProduct?.productVariants.find(
        variant => variant.productVariantId === Number(selectedVariantId)
    )

    if (showAdminPanel) {
        return (
            <div>
                <nav style={{
                    backgroundColor: "#111",
                    color: "white",
                    padding: "20px",
                    display: "flex",
                    justifyContent: "space-between"
                }}>
                    <h2>TeeCraft Admin</h2>

                    <span
                        onClick={() => setShowAdminPanel(false)}
                        style={{ cursor: "pointer" }}
                    >
                        Back to store
                    </span>
                </nav>

                <section style={{ padding: "40px", textAlign: "center" }}>
                    <h1>Admin Dashboard</h1>

                    <div style={{
                        display: "flex",
                        justifyContent: "center",
                        gap: "20px",
                        marginBottom: "30px"
                    }}>
                        <button
                            onClick={async () => {
                                if (adminDashboard) {
                                    setAdminDashboard(null)
                                    return
                                }

                                const response = await fetch("https://localhost:7042/api/Admin/dashboard", {
                                    headers: {
                                        "Authorization": `Bearer ${token}`
                                    }
                                })

                                if (!response.ok) {
                                    alert("Could not load admin dashboard")
                                    return
                                }

                                const data = await response.json()
                                setAdminDashboard(data)
                            }}
                            style={{
                                padding: "12px 25px",
                                backgroundColor: "black",
                                color: "white",
                                border: "none",
                                cursor: "pointer"
                            }}
                        >
                            {adminDashboard ? "Hide Dashboard" : "Load Dashboard"}
                        </button>

                        <button
                            onClick={async () => {
                                if (adminOrders.length > 0) {
                                    setAdminOrders([])
                                    return
                                }

                                const response = await fetch("https://localhost:7042/api/Orders", {
                                    headers: {
                                        "Authorization": `Bearer ${token}`
                                    }
                                })

                                if (!response.ok) {
                                    alert("Could not load orders")
                                    return
                                }

                                const data = await response.json()
                                setAdminOrders(data)
                            }}
                            style={{
                                padding: "12px 25px",
                                backgroundColor: "black",
                                color: "white",
                                border: "none",
                                cursor: "pointer"
                            }}
                        >
                            {adminOrders.length > 0 ? "Hide Orders" : "Load Orders"}
                        </button>

                        <button
                            onClick={async () => {
                                if (showLowStock) {
                                    setShowLowStock(false)
                                    setLowStockVariants([])
                                    return
                                }

                                const response = await fetch("https://localhost:7042/api/Admin/low-stock", {
                                    headers: {
                                        "Authorization": `Bearer ${token}`
                                    }
                                })

                                if (!response.ok) {
                                    alert("Could not load low stock variants")
                                    return
                                }

                                const data = await response.json()
                                setLowStockVariants(data)
                                setShowLowStock(true)
                            }}
                            style={{
                                padding: "12px 25px",
                                backgroundColor: "black",
                                color: "white",
                                border: "none",
                                cursor: "pointer"
                            }}
                        >
                            {showLowStock ? "Hide Low Stock" : "Load Low Stock"}
                        </button>

                        <button
                            onClick={async () => {
                                if (showVariants) {
                                    setShowVariants(false)
                                    setProductVariants([])
                                    return
                                }

                                const response = await fetch(
                                    "https://localhost:7042/api/ProductVariants",
                                    {
                                        headers: {
                                            "Authorization": `Bearer ${token}`
                                        }
                                    }
                                )

                                if (!response.ok) {
                                    alert("Could not load variants")
                                    return
                                }

                                const data = await response.json()

                                setProductVariants(data)
                                setShowVariants(true)
                            }}
                            style={{
                                padding: "12px 25px",
                                backgroundColor: "black",
                                color: "white",
                                border: "none",
                                cursor: "pointer"
                            }}
                        >
                            {showVariants ? "Hide Variants" : "Manage Stock"}
                        </button>
                    </div>

                    {showLowStock && lowStockVariants.length === 0 ? (
                        <p style={{ textAlign: "center", marginTop: "20px" }}>
                            No low stock variants found.
                        </p>
                    ) : null}

                    {showAdminProducts && (
                        <div style={{ maxWidth: "800px", margin: "30px auto" }}>
                            <div
                                style={{
                                    maxWidth: "800px",
                                    margin: "20px auto",
                                    border: "1px solid #ddd",
                                    padding: "20px"
                                }}
                            >
                                <h2>Create Product</h2>

                                <input
                                    placeholder="Name"
                                    value={newName}
                                    onChange={(e) => setNewName(e.target.value)}
                                />

                                <br /><br />

                                <input
                                    placeholder="Description"
                                    value={newDescription}
                                    onChange={(e) => setNewDescription(e.target.value)}
                                />

                                <br /><br />

                                <input
                                    placeholder="Price"
                                    type="number"
                                    value={newBasePrice}
                                    onChange={(e) => setNewBasePrice(e.target.value)}
                                />

                                <br /><br />

                                <input
                                    placeholder="Image URL"
                                    value={newImageUrl}
                                    onChange={(e) => setNewImageUrl(e.target.value)}
                                />

                                <br /><br />

                                <input
                                    placeholder="Category Id"
                                    type="number"
                                    value={newCategoryId}
                                    onChange={(e) => setNewCategoryId(e.target.value)}
                                />

                                <br /><br />

                                <button
                                    onClick={async () => {
                                        const response = await fetch(
                                            "https://localhost:7042/api/Products",
                                            {
                                                method: "POST",
                                                headers: {
                                                    "Content-Type": "application/json",
                                                    "Authorization": `Bearer ${token}`
                                                },
                                                body: JSON.stringify({
                                                    name: newName,
                                                    description: newDescription,
                                                    basePrice: Number(newBasePrice),
                                                    imageUrl: newImageUrl,
                                                    categoryId: Number(newCategoryId)
                                                })
                                            }
                                        )

                                        if (!response.ok) {
                                            alert("Could not create product")
                                            return
                                        }

                                        const refreshedResponse = await fetch(
                                            "https://localhost:7042/api/Products",
                                            {
                                                headers: {
                                                    "Authorization": `Bearer ${token}`
                                                }
                                            }
                                        )

                                        if (refreshedResponse.ok) {
                                            const refreshedData = await refreshedResponse.json()
                                            setAdminProducts(refreshedData.items)
                                        }

                                        alert("Product created")

                                        setNewName("")
                                        setNewDescription("")
                                        setNewBasePrice("")
                                        setNewImageUrl("")
                                        setNewCategoryId("")
                                    }}
                                    style={{
                                        padding: "10px 20px",
                                        backgroundColor: "green",
                                        color: "white",
                                        border: "none",
                                        cursor: "pointer"
                                    }}
                                >
                                    Create Product
                                </button>
                            </div>

                            <h2>Manage Products</h2>

                            <div
                                style={{
                                    maxWidth: "800px",
                                    margin: "20px auto",
                                    border: "1px solid #ddd",
                                    padding: "20px"
                                }}
                            >
                                <h2>Create Variant</h2>

                                <select
                                    value={variantProductId}
                                    onChange={(e) => setVariantProductId(e.target.value)}
                                >
                                    <option value="">Select product</option>
                                    {adminProducts.map(product => (
                                        <option key={product.productId} value={product.productId}>
                                            {product.name}
                                        </option>
                                    ))}
                                </select>

                                <br /><br />

                                <input
                                    placeholder="Color"
                                    value={variantColor}
                                    onChange={(e) => setVariantColor(e.target.value)}
                                />

                                <br /><br />

                                <input
                                    placeholder="Size"
                                    value={variantSize}
                                    onChange={(e) => setVariantSize(e.target.value)}
                                />

                                <br /><br />

                                <input
                                    placeholder="Fit"
                                    value={variantFit}
                                    onChange={(e) => setVariantFit(e.target.value)}
                                />

                                <br /><br />

                                <input
                                    placeholder="Stock Quantity"
                                    type="number"
                                    value={variantStockQuantity}
                                    onChange={(e) => setVariantStockQuantity(e.target.value)}
                                />

                                <br /><br />

                                <input
                                    placeholder="Price"
                                    type="number"
                                    value={variantPrice}
                                    onChange={(e) => setVariantPrice(e.target.value)}
                                />

                                <br /><br />

                                <button
                                    onClick={async () => {
                                        const response = await fetch(
                                            "https://localhost:7042/api/ProductVariants",
                                            {
                                                method: "POST",
                                                headers: {
                                                    "Content-Type": "application/json",
                                                    "Authorization": `Bearer ${token}`
                                                },
                                                body: JSON.stringify({
                                                    productId: Number(variantProductId),
                                                    color: variantColor,
                                                    size: variantSize,
                                                    fit: variantFit,
                                                    stockQuantity: Number(variantStockQuantity),
                                                    price: Number(variantPrice)
                                                })
                                            }
                                        )

                                        if (!response.ok) {
                                            alert("Could not create variant")
                                            return
                                        }

                                        alert("Variant created")

                                        setVariantProductId("")
                                        setVariantColor("")
                                        setVariantSize("")
                                        setVariantFit("")
                                        setVariantStockQuantity("")
                                        setVariantPrice("")
                                    }}
                                    style={{
                                        padding: "10px 20px",
                                        backgroundColor: "green",
                                        color: "white",
                                        border: "none",
                                        cursor: "pointer"
                                    }}
                                >
                                    Create Variant
                                </button>
                            </div>

                            {adminProducts.map(product => (
                                <div
                                    key={product.productId}
                                    style={{
                                        border: "1px solid #ddd",
                                        padding: "20px",
                                        marginBottom: "15px"
                                    }}
                                >
                                    <h3>{product.name}</h3>
                                    <p>{product.description}</p>
                                    <p>Price: {product.basePrice} kr</p>
                                    <p>Category: {product.categoryName}</p>

                                    <button
                                        onClick={() => {
                                            setEditingProductId(product.productId)
                                            setEditName(product.name)
                                            setEditDescription(product.description)
                                            setEditBasePrice(product.basePrice)
                                            setEditImageUrl(product.imageUrl)
                                            setEditCategoryId(product.categoryId)
                                        }}
                                        style={{
                                            padding: "10px 20px",
                                            backgroundColor: "orange",
                                            color: "white",
                                            border: "none",
                                            cursor: "pointer",
                                            marginRight: "10px"
                                        }}
                                    >
                                        Edit
                                    </button>

                                    <button
                                        onClick={async () => {
                                            const confirmDelete = window.confirm(
                                                `Are you sure you want to delete ${product.name}?`
                                            )

                                            if (!confirmDelete) {
                                                return
                                            }

                                            const response = await fetch(
                                                `https://localhost:7042/api/Products/${product.productId}`,
                                                {
                                                    method: "DELETE",
                                                    headers: {
                                                        "Authorization": `Bearer ${token}`
                                                    }
                                                }
                                            )

                                            if (!response.ok) {
                                                alert("Could not delete product")
                                                return
                                            }

                                            setAdminProducts(
                                                adminProducts.filter(
                                                    p => p.productId !== product.productId
                                                )
                                            )

                                            alert("Product deleted")
                                        }}
                                        style={{
                                            padding: "10px 20px",
                                            backgroundColor: "red",
                                            color: "white",
                                            border: "none",
                                            cursor: "pointer"
                                        }}
                                    >
                                        Delete
                                    </button>

                                    {editingProductId === product.productId && (
                                        <div
                                            style={{
                                                marginTop: "20px",
                                                display: "flex",
                                                flexDirection: "column",
                                                gap: "10px"
                                            }}
                                        >
                                            <input
                                                value={editName}
                                                onChange={(e) => setEditName(e.target.value)}
                                            />

                                            <input
                                                value={editDescription}
                                                onChange={(e) => setEditDescription(e.target.value)}
                                            />

                                            <input
                                                type="number"
                                                value={editBasePrice}
                                                onChange={(e) => setEditBasePrice(e.target.value)}
                                            />

                                            <input
                                                value={editImageUrl}
                                                onChange={(e) => setEditImageUrl(e.target.value)}
                                            />

                                            <input
                                                type="number"
                                                value={editCategoryId}
                                                onChange={(e) => setEditCategoryId(e.target.value)}
                                            />

                                            <button
                                                onClick={async () => {
                                                    const response = await fetch(
                                                        `https://localhost:7042/api/Products/${product.productId}`,
                                                        {
                                                            method: "PUT",
                                                            headers: {
                                                                "Content-Type": "application/json",
                                                                "Authorization": `Bearer ${token}`
                                                            },
                                                            body: JSON.stringify({
                                                                name: editName,
                                                                description: editDescription,
                                                                basePrice: Number(editBasePrice),
                                                                imageUrl: editImageUrl,
                                                                categoryId: Number(editCategoryId)
                                                            })
                                                        }
                                                    )

                                                    if (!response.ok) {
                                                        alert("Could not update product")
                                                        return
                                                    }

                                                    setAdminProducts(adminProducts.map(p =>
                                                        p.productId === product.productId
                                                            ? {
                                                                ...p,
                                                                name: editName,
                                                                description: editDescription,
                                                                basePrice: Number(editBasePrice),
                                                                imageUrl: editImageUrl,
                                                                categoryId: Number(editCategoryId)
                                                            }
                                                            : p
                                                    ))

                                                    setEditingProductId(null)
                                                    alert("Product updated")
                                                }}
                                            >
                                                Save
                                            </button>

                                            <button onClick={() => setEditingProductId(null)}>
                                                Cancel
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}

                </section>
                    
                    <button
                        onClick={async () => {

                            if (showAdminProducts) {
                                setShowAdminProducts(false)
                                setAdminProducts([])
                                return
                            }

                            const response = await fetch(
                                "https://localhost:7042/api/Products",
                                {
                                    headers: {
                                        "Authorization": `Bearer ${token}`
                                    }
                                }
                            )

                            if (!response.ok) {
                                alert("Could not load products")
                                return
                            }

                            const data = await response.json()

                            setAdminProducts(data.items)
                            setShowAdminProducts(true)
                        }}
                        style={{
                            padding: "12px 25px",
                            backgroundColor: "black",
                            color: "white",
                            border: "none",
                            cursor: "pointer"
                        }}
                    >
                        {showAdminProducts ? "Hide Products" : "Manage Products"}
                    </button>

                    {showVariants && productVariants.length > 0 && (
                        <div style={{ maxWidth: "900px", margin: "30px auto" }}>
                            <h2>Manage Stock</h2>

                            {productVariants.map(variant => (
                                <div
                                    key={variant.productVariantId}
                                    style={{
                                        border: "1px solid #ddd",
                                        padding: "20px",
                                        marginBottom: "15px"
                                    }}
                                >
                                    <h3>{variant.productName}</h3>
                                    <p>Color: {variant.color}</p>
                                    <p>Size: {variant.size}</p>
                                    <p>Current stock: {variant.stockQuantity}</p>

                                    <input
                                        type="number"
                                        placeholder="New stock quantity"
                                        value={editingStockVariantId === variant.productVariantId ? newStockQuantity : ""}
                                        onChange={(e) => {
                                            setEditingStockVariantId(variant.productVariantId)
                                            setNewStockQuantity(e.target.value)
                                        }}
                                        style={{
                                            padding: "8px",
                                            marginRight: "10px"
                                        }}
                                    />

                                    <button
                                        onClick={async () => {
                                            const response = await fetch(
                                                `https://localhost:7042/api/ProductVariants/${variant.productVariantId}/stock`,
                                                {
                                                    method: "PUT",
                                                    headers: {
                                                        "Content-Type": "application/json",
                                                        "Authorization": `Bearer ${token}`
                                                    },
                                                    body: JSON.stringify({
                                                        stockQuantity: Number(newStockQuantity)
                                                    })
                                                }
                                            )

                                            if (!response.ok) {
                                                alert("Could not update stock")
                                                return
                                            }

                                            setProductVariants(productVariants.map(v =>
                                                v.productVariantId === variant.productVariantId
                                                    ? { ...v, stockQuantity: Number(newStockQuantity) }
                                                    : v
                                            ))

                                            setEditingStockVariantId(null)
                                            setNewStockQuantity("")

                                            alert("Stock updated")
                                        }}
                                        style={{
                                            padding: "8px 15px",
                                            backgroundColor: "black",
                                            color: "white",
                                            border: "none",
                                            cursor: "pointer"
                                        }}
                                    >
                                        Update Stock
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}

                    {adminOrders.map(order => (
                        <div
                            key={order.orderId}
                            style={{
                                border: "1px solid #ddd",
                                padding: "20px",
                                marginBottom: "20px",
                                maxWidth: "700px",
                                margin: "20px auto"
                            }}
                        >
                            <h3>Order #{order.orderId}</h3>

                            <p>Customer: {order.customerName}</p>
                            <p>Email: {order.customerEmail}</p>
                            <p>Address: {order.customerAddress}</p>
                            <p>Status: {order.status}</p>
                            <p>Total: {order.totalAmount} kr</p>
                            <p>Order date: {new Date(order.orderDate).toLocaleString()}</p>
                            <p>Payment: {order.paymentMethod}</p>
                            <p>Payment status: {order.paymentStatus}</p>

                            <h4>Items</h4>

                            {order.items && order.items.length > 0 ? (
                                order.items.map(item => (
                                    <div
                                        key={item.orderItemId}
                                        style={{
                                            borderTop: "1px solid #ddd",
                                            paddingTop: "10px",
                                            marginTop: "10px"
                                        }}
                                    >
                                        <p>Product: {item.productName}</p>
                                        <p>Size: {item.size}</p>
                                        <p>Quantity: {item.quantity}</p>
                                        <p>Unit price: {item.unitPrice} kr</p>
                                    </div>
                                ))
                            ) : (
                                <p>No items found for this order.</p>
                            )}

                            <select
                                value={order.status}
                                onChange={async (e) => {
                                    const newStatus = e.target.value

                                    const response = await fetch(
                                        `https://localhost:7042/api/Orders/${order.orderId}/status`,
                                        {
                                            method: "PUT",
                                            headers: {
                                                "Content-Type": "application/json",
                                                "Authorization": `Bearer ${token}`
                                            },
                                            body: JSON.stringify({
                                                status: newStatus
                                            })
                                        }
                                    )

                                    if (!response.ok) {
                                        alert("Could not update status")
                                        return
                                    }

                                    setAdminOrders(adminOrders.map(o =>
                                        o.orderId === order.orderId
                                            ? { ...o, status: newStatus }
                                            : o
                                    ))
                                }}
                                style={{
                                    padding: "8px",
                                    marginTop: "10px"
                                }}
                            >
                                <option value="Created">Created</option>
                                <option value="Processing">Processing</option>
                                <option value="Shipped">Shipped</option>
                                <option value="Completed">Completed</option>
                                <option value="Cancelled">Cancelled</option>
                            </select>

                            <button
                                onClick={async () => {
                                    if (orderHistories[order.orderId]) {
                                        const updatedHistories = { ...orderHistories }
                                        delete updatedHistories[order.orderId]
                                        setOrderHistories(updatedHistories)
                                        return
                                    }

                                    const response = await fetch(`https://localhost:7042/api/Orders/${order.orderId}/history`, {
                                        headers: {
                                            "Authorization": `Bearer ${token}`
                                        }
                                    })

                                    if (!response.ok) {
                                        alert("Could not load order history")
                                        return
                                    }

                                    const data = await response.json()

                                    setOrderHistories({
                                        ...orderHistories,
                                        [order.orderId]: data
                                    })
                                }}
                                style={{
                                    marginTop: "10px",
                                    marginLeft: "10px"
                                }}
                            >
                                {orderHistories[order.orderId] ? "Hide History" : "View History"}
                            </button>

                            {orderHistories[order.orderId] && (
                                <div style={{ marginTop: "20px" }}>
                                    <h4>Order History</h4>

                                    {orderHistories[order.orderId].map(history => (
                                        <div
                                            key={history.orderStatusHistoryId}
                                            style={{
                                                borderTop: "1px solid #ddd",
                                                padding: "10px 0"
                                            }}
                                        >
                                            <p>{history.oldStatus} → {history.newStatus}</p>
                                            <p>{new Date(history.changedAt).toLocaleString()}</p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}

                    {lowStockVariants.length > 0 && (
                        <div style={{ maxWidth: "800px", margin: "30px auto" }}>
                            <h2>Low Stock Variants</h2>

                            {lowStockVariants.map(variant => (
                                <div
                                    key={variant.productVariantId}
                                    style={{
                                        border: "1px solid #ddd",
                                        padding: "20px",
                                        marginBottom: "15px"
                                    }}
                                >
                                    <p>Product: {variant.productName}</p>
                                    <p>Color: {variant.color}</p>
                                    <p>Size: {variant.size}</p>
                                    <p>Stock: {variant.stockQuantity}</p>
                                </div>
                            ))}
                        </div>
                    )}

                    {adminDashboard && (
                        <div style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(3, 1fr)",
                            gap: "20px",
                            maxWidth: "900px",
                            margin: "0 auto"
                        }}>
                            <div style={{ border: "1px solid #ddd", padding: "20px" }}>
                                <h3>Total Products</h3>
                                <p>{adminDashboard.totalProducts}</p>
                            </div>

                            <div style={{ border: "1px solid #ddd", padding: "20px" }}>
                                <h3>Total Customers</h3>
                                <p>{adminDashboard.totalCustomers}</p>
                            </div>

                            <div style={{ border: "1px solid #ddd", padding: "20px" }}>
                                <h3>Total Orders</h3>
                                <p>{adminDashboard.totalOrders}</p>
                            </div>

                            <div style={{ border: "1px solid #ddd", padding: "20px" }}>
                                <h3>Total Reviews</h3>
                                <p>{adminDashboard.totalReviews}</p>
                            </div>

                            <div style={{ border: "1px solid #ddd", padding: "20px" }}>
                                <h3>Total Sales</h3>
                                <p>{adminDashboard.totalSales}</p>
                            </div>

                            <div style={{ border: "1px solid #ddd", padding: "20px" }}>
                                <h3>Low Stock Variants</h3>
                                <p>{adminDashboard.lowStockVariants}</p>
                            </div>
                        </div>
                    )}
                
            </div>
        )
    }

    if (showLogin) {
        return (
            <div>
                <nav style={{
                    backgroundColor: "#111",
                    color: "white",
                    padding: "20px",
                    display: "flex",
                    justifyContent: "space-between"
                }}>
                    <h2>TeeCraft</h2>

                    <span
                        onClick={() => setShowLogin(false)}
                        style={{ cursor: "pointer" }}
                    >
                        Home
                    </span>
                </nav>

                <section style={{ padding: "80px", textAlign: "center" }}>
                    <h1>Login</h1>

                    <div style={{
                        marginTop: "30px",
                        display: "flex",
                        flexDirection: "column",
                        gap: "15px",
                        maxWidth: "400px",
                        marginLeft: "auto",
                        marginRight: "auto"
                    }}>
                        <input
                            type="email"
                            placeholder="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            style={{ padding: "12px", fontSize: "16px" }}
                        />

                        <input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            style={{ padding: "12px", fontSize: "16px" }}
                        />

                        <button
                            onClick={loginUser}
                            style={{
                                padding: "15px 30px",
                                backgroundColor: "black",
                                color: "white",
                                border: "none",
                                cursor: "pointer",
                                fontSize: "16px"
                            }}
                        >
                            Login
                        </button>

                        <button
                            onClick={() => {
                                setShowLogin(false)
                                setShowRegister(true)
                            }}
                            style={{
                                padding: "15px 30px",
                                backgroundColor: "white",
                                color: "black",
                                border: "1px solid black",
                                cursor: "pointer",
                                fontSize: "16px"
                            }}
                        >
                            Create account
                        </button>
                    </div>
                </section>
            </div>
        )
    }

    if (showRegister) {
        return (
            <div>
                <nav style={{
                    backgroundColor: "#111",
                    color: "white",
                    padding: "20px",
                    display: "flex",
                    justifyContent: "space-between"
                }}>
                    <h2>TeeCraft</h2>

                    <span
                        onClick={() => setShowRegister(false)}
                        style={{ cursor: "pointer" }}
                    >
                        Home
                    </span>
                </nav>

                <section style={{ padding: "80px", textAlign: "center" }}>
                    <h1>Register</h1>

                    <div style={{
                        marginTop: "30px",
                        display: "flex",
                        flexDirection: "column",
                        gap: "15px",
                        maxWidth: "400px",
                        marginLeft: "auto",
                        marginRight: "auto"
                    }}>
                        <input
                            type="email"
                            placeholder="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            style={{ padding: "12px", fontSize: "16px" }}
                        />

                        <input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            style={{ padding: "12px", fontSize: "16px" }}
                        />

                        <input
                            type="text"
                            placeholder="First name"
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                            style={{ padding: "12px", fontSize: "16px" }}
                        />

                        <input
                            type="text"
                            placeholder="Last name"
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                            style={{ padding: "12px", fontSize: "16px" }}
                        />

                        <input
                            type="text"
                            placeholder="Address"
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                            style={{ padding: "12px", fontSize: "16px" }}
                        />

                        <input
                            type="text"
                            placeholder="Phone number"
                            value={phoneNumber}
                            onChange={(e) => setPhoneNumber(e.target.value)}
                            style={{
                                padding: "12px",
                                fontSize: "16px"
                            }}
                        />

                        <button
                            onClick={registerUser}
                            style={{
                                padding: "15px 30px",
                                backgroundColor: "black",
                                color: "white",
                                border: "none",
                                cursor: "pointer",
                                fontSize: "16px"
                            }}
                        >
                            Register
                        </button>
                    </div>
                </section>
            </div>
        )
    }

    if (showCart) {
        return (
            <div>
                <nav style={{
                    backgroundColor: "#111",
                    color: "white",
                    padding: "20px",
                    display: "flex",
                    justifyContent: "space-between"
                }}>
                    <h2
                        style={{ cursor: "pointer", color: "white" }}
                        onClick={() => setShowCart(false)}
                    >
                        TeeCraft
                    </h2>

                    <div>
                        <span
                            onClick={() => {
                                setShowCart(false)
                                setSelectedProduct(null)
                            }}
                            style={{ marginRight: "20px", cursor: "pointer" }}
                        >
                            Home
                        </span>

                        <span style={{ cursor: "pointer" }}>
                            Cart ({cart.length})
                        </span>
                    </div>
                </nav>

                <section style={{
                    padding: "40px",
                    maxWidth: "900px",
                    margin: "0 auto"
                }}>
                    <button
                        onClick={() => setShowCart(false)}
                        style={{
                            padding: "10px 20px",
                            backgroundColor: "black",
                            color: "white",
                            border: "none",
                            cursor: "pointer",
                            marginBottom: "20px"
                        }}
                    >
                        Back to products
                    </button>

                    {cart.length === 0 ? (
                        <p>Your cart is empty.</p>
                    ) : (
                        <>
                            {cart.map((item, index) => (
                                <div
                                    key={index}
                                    style={{
                                        border: "1px solid #ddd",
                                        padding: "20px",
                                        marginBottom: "20px",
                                        textAlign: "center"
                                    }}
                                >
                                    <h3>{item.name}</h3>
                                    <p>{item.description}</p>
                                    <h2>{item.selectedVariant?.price ?? item.basePrice} kr</h2>

                                    {item.selectedVariant && (
                                        <div>
                                            <p>Color: {item.selectedVariant.color}</p>
                                            <p>Size: {item.selectedVariant.size}</p>
                                            <p>Fit: {item.selectedVariant.fit}</p>
                                        </div>
                                    )}

                                    <div style={{ marginBottom: "10px" }}>
                                        <button
                                            onClick={() => decreaseQuantity(item.productId, item.selectedVariant.productVariantId)}
                                            style={{
                                                padding: "5px 10px",
                                                marginRight: "10px",
                                                cursor: "pointer"
                                            }}
                                        >
                                            -
                                        </button>

                                        <span>Quantity: {item.quantity}</span>

                                        <button
                                            onClick={() => increaseQuantity(item.productId, item.selectedVariant.productVariantId)}
                                            style={{
                                                padding: "5px 10px",
                                                marginLeft: "10px",
                                                cursor: "pointer"
                                            }}
                                        >
                                            +
                                        </button>
                                    </div>

                                    <button
                                        onClick={() => removeFromCart(index)}
                                        style={{
                                            padding: "10px 20px",
                                            backgroundColor: "red",
                                            color: "white",
                                            border: "none",
                                            cursor: "pointer"
                                        }}
                                    >
                                        Remove
                                    </button>
                                </div>
                            ))}

                            <h2 style={{ marginTop: "30px" }}>
                                Total: {cartTotal} kr
                            </h2>

                            <button
                                onClick={() => {
                                    setShowCart(false)
                                    setShowCheckout(true)
                                }}
                                style={{
                                    marginTop: "20px",
                                    padding: "15px 30px",
                                    backgroundColor: "black",
                                    color: "white",
                                    border: "none",
                                    cursor: "pointer",
                                    fontSize: "16px"
                                }}
                            >
                                Proceed to Checkout
                            </button>
                        </>
                    )}
                </section>
            </div>
        )
    }

    if (showCheckout) {
        return (
            <div>
                <nav style={{
                    backgroundColor: "#111",
                    color: "white",
                    padding: "20px",
                    display: "flex",
                    justifyContent: "space-between"
                }}>
                    <h2>TeeCraft</h2>

                    <span
                        onClick={() => {
                            setShowCheckout(false)
                            setShowCart(true)
                        }}
                        style={{ cursor: "pointer" }}
                    >
                        Back to Cart
                    </span>
                </nav>

                <section style={{ padding: "80px", textAlign: "center" }}>
                    <h1>Checkout</h1>

                    <p style={{ marginTop: "20px" }}>
                        Total Amount: {cartTotal} kr
                    </p>

                    <div style={{
                        marginTop: "30px",
                        display: "flex",
                        flexDirection: "column",
                        gap: "15px",
                        maxWidth: "400px",
                        marginLeft: "auto",
                        marginRight: "auto"
                    }}>
                        <input
                            type="text"
                            placeholder="Full name"
                            value={customerName}
                            onChange={(e) => setCustomerName(e.target.value)}
                            style={{ padding: "12px", fontSize: "16px" }}
                        />

                        <input
                            type="email"
                            placeholder="Email"
                            value={customerEmail}
                            onChange={(e) => setCustomerEmail(e.target.value)}
                            style={{ padding: "12px", fontSize: "16px" }}
                        />

                        <input
                            type="text"
                            placeholder="Address"
                            value={customerAddress}
                            onChange={(e) => setCustomerAddress(e.target.value)}
                            style={{ padding: "12px", fontSize: "16px" }}
                        />
                    </div>

                    <button
                        onClick={async () => {
                            if (!token) {
                                alert("Please login before checkout.")
                                setShowLogin(true)
                                return
                            }

                            if (!customerName || !customerEmail || !customerAddress) {
                                alert("Please fill in all checkout fields.")
                                return
                            }

                            if (!customerEmail.includes("@")) {
                                alert("Please enter a valid email address.")
                                return
                            }

                            const response = await fetch("https://localhost:7042/api/Orders/checkout", {
                                method: "POST",
                                headers: {
                                    "Content-Type": "application/json",
                                    "Authorization": `Bearer ${token}`
                                },
                                body: JSON.stringify({
                                    paymentMethod: "Card"
                                })
                            })

                            if (!response.ok) {
                                alert("Checkout failed.")
                                return
                            }

                            alert("Purchase completed!")

                            setCart([])
                            localStorage.removeItem("cart")
                            setCustomerName("")
                            setCustomerEmail("")
                            setCustomerAddress("")
                            setShowCheckout(false)
                            setShowCart(false)
                            setSelectedProduct(null)

                            fetchProducts()
                        }}
                        style={{
                            marginTop: "30px",
                            padding: "15px 30px",
                            backgroundColor: "green",
                            color: "white",
                            border: "none",
                            cursor: "pointer",
                            fontSize: "16px"
                        }}
                    >
                        Complete Purchase
                    </button>
                </section>
            </div>
        )
    }
    if (showOrders) {
        return (
            <div>
                <nav style={{
                    backgroundColor: "#111",
                    color: "white",
                    padding: "20px",
                    display: "flex",
                    justifyContent: "space-between"
                }}>
                    <h2>TeeCraft</h2>

                    <span
                        onClick={() => setShowOrders(false)}
                        style={{ cursor: "pointer" }}
                    >
                        Back
                    </span>
                </nav>

                <section style={{ padding: "40px" }}>
                    <h1>My Orders</h1>

                    {orders.map(order => (
                        <div
                            key={order.orderId}
                            style={{
                                border: "1px solid #ddd",
                                padding: "20px",
                                marginBottom: "20px"
                            }}
                        >
                            <p>Order ID: {order.orderId}</p>
                            <p>Status: {order.status}</p>
                            <p>Total: {order.totalAmount} kr</p>
                            <p>Date: {order.orderDate}</p>
                            <h4>Items</h4>

                            {order.items?.map(item => (
                                <div key={item.orderItemId}>
                                    <p>Product Variant ID: {item.productVariantId}</p>
                                    <p>Quantity: {item.quantity}</p>
                                    <p>Unit Price: {item.unitPrice} kr</p>
                                </div>
                            ))}
                        </div>
                    ))}
                </section>
            </div>
        )
    }
    if (selectedProduct) {
        return (
            <div>
                <nav style={{
                    backgroundColor: "#111",
                    color: "white",
                    padding: "20px",
                    display: "flex",
                    justifyContent: "space-between"
                }}>
                    <h2
                        style={{ color: "white", cursor: "pointer" }}
                        onClick={() => setSelectedProduct(null)}
                    >
                        TeeCraft
                    </h2>

                    <span
                        onClick={() => setShowCart(true)}
                        style={{ color: "white", cursor: "pointer" }}
                    >
                        Cart ({cart.length})
                    </span>

                    <button
                        onClick={() => setSelectedProduct(null)}
                        style={{
                            backgroundColor: "transparent",
                            color: "white",
                            border: "none",
                            cursor: "pointer",
                            fontSize: "16px"
                        }}
                    >
                        Back to products
                    </button>
                </nav>

                <section style={{
                    padding: "80px",
                    display: "flex",
                    gap: "50px",
                    justifyContent: "center",
                    alignItems: "flex-start"
                }}>
                    <img
                        src={
                            selectedProduct.name === "Black Tee"
                                ? blackTee
                                : selectedProduct.name === "White Tee"
                                    ? whiteTee
                                    : selectedProduct.name === "Navy Blue Tee"
                                        ? navyTee
                                        : selectedProduct.name === "Navy Blue Tee"
                                            ? navyTee
                                            : selectedProduct.name === "Green Tee"
                                                ? greenTee
                                                : redTee
                        }
                        alt={selectedProduct.name}
                        style={{
                            width: "45%",
                            height: "700px",
                            objectFit: "contain"
                        }}
                    />

                    <div style={{ maxWidth: "450px" }}>
                        <h1 style={{ fontSize: "42px" }}>{selectedProduct.name}</h1>

                        <p style={{ fontSize: "18px", color: "#555" }}>
                            {selectedProduct.description}
                        </p>

                        <h2>{selectedProduct.basePrice} kr</h2>

                        <p>Category: {selectedProduct.categoryName}</p>
                        <p>Rating: {selectedProduct.averageRating}</p>
                        <p>Reviews: {selectedProduct.reviewCount}</p>

                        <h3>Variants</h3>

                        <select
                            value={selectedVariantId}
                            onChange={(e) => setSelectedVariantId(e.target.value)}
                            style={{
                                padding: "12px",
                                marginBottom: "20px",
                                fontSize: "16px"
                            }}
                        >
                            <option value="">Select variant</option>

                            {selectedProduct.productVariants.map(variant => (
                                <option
                                    key={variant.productVariantId}
                                    value={variant.productVariantId}
                                >
                                    {variant.color} - {variant.size} - {variant.fit} - {variant.price} kr
                                </option>
                            ))}
                        </select>

                        {selectedVariant && (
                            <p>
                                Stock available: {selectedVariant.stockQuantity}
                            </p>
                        )}

                        {selectedProduct.productVariants.map(variant => (
                            <div
                                key={variant.productVariantId}
                                style={{
                                    border: "1px solid #ddd",
                                    padding: "12px",
                                    marginBottom: "10px"
                                }}
                            >
                                <p>Color: {variant.color}</p>
                                <p>Size: {variant.size}</p>
                                <p>Fit: {variant.fit}</p>
                                <p>Price: {variant.price} kr</p>
                            </div>
                        ))}

                        <button
                            onClick={() => {
                                if (!selectedVariantId) {
                                    alert("Please select a variant first.")
                                    return
                                }

                                const selectedVariant = selectedProduct.productVariants.find(
                                    variant => variant.productVariantId === Number(selectedVariantId)
                                )

                                addToCart({
                                    ...selectedProduct,
                                    selectedVariant: selectedVariant
                                })
                            }}
                            style={{
                                marginTop: "20px",
                                padding: "15px 30px",
                                backgroundColor: "black",
                                color: "white",
                                border: "none",
                                cursor: "pointer",
                                fontSize: "16px"
                            }}
                        >
                            Add to Cart
                        </button>
                    </div>
                </section>
            </div>
        )
    }

    return (
        <div>
            <nav style={{
                backgroundColor: "#111",
                color: "white",
                padding: "20px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center"
            }}>
                <h2 style={{ color: "white" }}>TeeCraft</h2>

                <div style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    border: "1px solid #777",
                    padding: "8px 12px",
                    width: "320px",
                    backgroundColor: "transparent",
                    marginLeft: "120px"
                }}>
                    <span style={{ color: "white", fontSize: "16px" }}>⌕</span>

                    <input
                        type="text"
                        placeholder="Search products..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{
                            width: "100%",
                            backgroundColor: "transparent",
                            border: "none",
                            color: "white",
                            outline: "none",
                            fontSize: "14px"
                        }}
                    />
                </div>

                <div>
                    <span
                        onClick={() => homeRef.current?.scrollIntoView({ behavior: "smooth" })}
                        style={{ marginRight: "20px", cursor: "pointer" }}
                    >
                        Home
                    </span>

                    <span
                        onClick={() => productsRef.current?.scrollIntoView({ behavior: "smooth" })}
                        style={{ marginRight: "20px", cursor: "pointer" }}
                    >
                        Products
                    </span>
                    {!token ? (
                        <>
                            <span
                                onClick={() => setShowLogin(true)}
                                style={{ marginRight: "20px", cursor: "pointer" }}
                            >
                                Login
                            </span>

                            <span
                                onClick={() => setShowRegister(true)}
                                style={{ marginRight: "20px", cursor: "pointer" }}
                            >
                                Register
                            </span>
                        </>
                    ) : (
                        <span
                            onClick={logoutUser}
                            style={{ marginRight: "20px", cursor: "pointer" }}
                        >
                            Logout
                        </span>
                    )}
                    <span
                        onClick={async () => {
                            const response = await fetch("https://localhost:7042/api/Orders/my-orders", {
                                headers: {
                                    "Authorization": `Bearer ${token}`
                                }
                            })

                            if (!response.ok) {
                                alert("Could not load orders")
                                return
                            }

                            const data = await response.json()

                            console.log(data)

                            setOrders(data)
                            setShowOrders(true)
                        }}
                        style={{ marginRight: "20px", cursor: "pointer" }}
                    >
                        My Orders
                    </span>
                    {role === "Admin" && (
                        <span
                            onClick={() => setShowAdminPanel(true)}
                            style={{ marginRight: "20px", cursor: "pointer" }}
                        >
                            Admin Panel
                        </span>
                    )}
                    <span
                        onClick={() => setShowCart(true)}
                        style={{ cursor: "pointer" }}
                    >
                        Cart ({cart.length})
                    </span>
                </div>
            </nav>

            <section
                onClick={() =>
                    productsRef.current?.scrollIntoView({ behavior: "smooth" })
                }
                style={{
                padding: "80px",
                textAlign: "center"
            }}>
                <h1 style={{ fontSize: "60px" }}>Premium T-Shirts</h1>
                <p style={{ fontSize: "20px" }}>T-shirts for modern fashion.</p>

                <button style={{
                    marginTop: "20px",
                    padding: "15px 30px",
                    backgroundColor: "black",
                    color: "white",
                    border: "none",
                    cursor: "pointer",
                    fontSize: "16px"
                }}>
                    Shop Now
                </button>
            </section>

            <section ref={homeRef} style={{ padding: "40px 80px" }}>
                <h2 ref={productsRef} style={{
                    textAlign: "center",
                    fontSize: "32px",
                    marginBottom: "30px"
                }}>
                    Featured Products
                </h2>

                <select
                    value={selectedColor}
                    onChange={(e) => setSelectedColor(e.target.value)}
                    style={{
                        padding: "12px",
                        marginBottom: "30px",
                        fontSize: "16px"
                    }}
                >
                    <option value="">All Colors</option>
                    <option value="Black">Black</option>
                    <option value="White">White</option>
                    <option value="Navy Blue">Navy Blue</option>
                    <option value="Red">Red</option>
                </select>

                <select
                    value={selectedSize}
                    onChange={(e) => setSelectedSize(e.target.value)}
                    style={{
                        padding: "12px",
                        marginBottom: "30px",
                        marginLeft: "10px",
                        fontSize: "16px"
                    }}
                >
                    <option value="">All Sizes</option>
                    <option value="S">S</option>
                    <option value="M">M</option>
                    <option value="L">L</option>
                    <option value="XL">XL</option>
                </select>

                <div style={{
                    display: "flex",
                    gap: "25px",
                    justifyContent: "center",
                    flexWrap: "wrap"
                }}>
                    {products
                        .filter(product =>
                            product.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
                            (
                                selectedColor === "" ||
                                product.productVariants.some(
                                    variant => variant.color === selectedColor
                                )
                            ) &&
                            (
                                selectedSize === "" ||
                                product.productVariants.some(
                                    variant => variant.size === selectedSize
                                )
                            )
                        )
                        .map(product => (
                            <div
                                key={product.productId}
                                style={{
                                    width: "250px",
                                    border: "1px solid #ddd",
                                    padding: "20px",
                                    textAlign: "center"
                                }}
                            >
                                <img
                                    src={
                                        product.name === "Black Tee"
                                            ? blackTee
                                            : product.name === "White Tee"
                                                ? whiteTee
                                                : product.name === "Navy Blue Tee"
                                                    ? navyTee
                                                    : product.name === "Green Tee"
                                                        ? greenTee
                                                        : redTee
                                    }
                                    alt={product.name}
                                    style={{
                                        width: "100%",
                                        height: "350px",
                                        objectFit: "contain",
                                        marginBottom: "15px"
                                    }}
                                />

                                <h3>{product.name}</h3>
                                <p>{product.description}</p>
                                <p>{product.basePrice} kr</p>

                                <button
                                    onClick={() => setSelectedProduct(product)}
                                    style={{
                                        padding: "10px 20px",
                                        backgroundColor: "black",
                                        color: "white",
                                        border: "none",
                                        cursor: "pointer"
                                    }}
                                >
                                    View Product
                                </button>
                            </div>
                        ))}
                </div>
            </section>
        </div>
    )
}

export default App