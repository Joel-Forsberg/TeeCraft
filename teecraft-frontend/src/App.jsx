import { useEffect, useState } from "react"
import blackTee from "./assets/black-tee.png"
import whiteTee from "./assets/white-tee.png"
import navyTee from "./assets/navy-tee.png"
import redTee from "./assets/red-tee.png"

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
    const [phoneNumber, setPhoneNumber] = useState("")

    const [orders, setOrders] = useState([])
    const [showOrders, setShowOrders] = useState(false)

    const [token, setToken] = useState(localStorage.getItem("token") || "")
    const [role, setRole] = useState(localStorage.getItem("role") || "")
    const [showAdminPanel, setShowAdminPanel] = useState(false)
    const [adminDashboard, setAdminDashboard] = useState(null)
    const [adminOrders, setAdminOrders] = useState([])

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

                    <button
                        onClick={async () => {
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
                            cursor: "pointer",
                            marginBottom: "30px"
                        }}
                    >
                        Load Dashboard
                    </button>

                    <div style={{ marginBottom: "30px" }}>

                        <button
                            onClick={async () => {
                                const response = await fetch("https://localhost:7042/api/Admin/dashboard", {
                                    headers: {
                                        "Authorization": `Bearer ${token}`
                                    }
                                })

                                if (!response.ok) {
                                    alert("Could not load dashboard")
                                    return
                                }

                                const data = await response.json()
                                setAdminDashboard(data)
                            }}                        >
                            Load Dashboard
                        </button>

                        <button
                            onClick={async () => {
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
                                marginLeft: "10px"
                            }}
                        >
                            Load Orders
                        </button>

                    </div>

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

                            <p>Status: {order.status}</p>
                            <p>Total: {order.totalAmount} kr</p>

                            <button
                                onClick={async () => {

                                    const response = await fetch(
                                        `https://localhost:7042/api/Orders/${order.orderId}/status`,
                                        {
                                            method: "PUT",
                                            headers: {
                                                "Content-Type": "application/json",
                                                "Authorization": `Bearer ${token}`
                                            },
                                            body: JSON.stringify({
                                                status: "Completed"
                                            })
                                        }
                                    )

                                    if (!response.ok) {
                                        alert("Could not update status")
                                        return
                                    }

                                    alert("Order updated")

                                    setAdminOrders(adminOrders.map(o =>
                                        o.orderId === order.orderId
                                            ? { ...o, status: "Completed" }
                                            : o
                                    ))

                                }}
                            >
                                Mark as Completed
                            </button>

                        </div>
                    ))}

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
                </section>
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
                            placeholder="Phone number"
                            value={phoneNumber}
                            onChange={(e) => setPhoneNumber(e.target.value)}
                            style={{ padding: "12px", fontSize: "16px" }}
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
                                        : redTee
                        }
                        alt={selectedProduct.name}
                        style={{
                            width: "45%",
                            height: "500px",
                            objectFit: "cover"
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
                    <span style={{ marginRight: "20px" }}>Home</span>
                    <span style={{ marginRight: "20px" }}>Products</span>

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

            <section style={{
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

            <section style={{ padding: "40px 80px" }}>
                <h2 style={{
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
                                                    : redTee
                                    }
                                    alt={product.name}
                                    style={{
                                        width: "100%",
                                        height: "220px",
                                        objectFit: "cover",
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