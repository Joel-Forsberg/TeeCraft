import { useEffect, useState } from "react"

function App() {
    const [products, setProducts] = useState([])
    const [selectedProduct, setSelectedProduct] = useState(null)
    const [cart, setCart] = useState(() => {
        const savedCart = localStorage.getItem("cart")

        return savedCart ? JSON.parse(savedCart) : []
    })
    const [showCart, setShowCart] = useState(false)
    const [showCheckout, setShowCheckout] = useState(false)
    const [customerName, setCustomerName] = useState("")
    const [customerEmail, setCustomerEmail] = useState("")
    const [customerAddress, setCustomerAddress] = useState("")
    const [searchTerm, setSearchTerm] = useState("")

    useEffect(() => {
        fetch("https://localhost:7042/api/Products?page=1&pageSize=10")
            .then(response => response.json())
            .then(data => {
                setProducts(data.items)
            })
    }, [])

    useEffect(() => {
        localStorage.setItem("cart", JSON.stringify(cart))
    }, [cart])
    function addToCart(product) {
        const existingItem = cart.find(item => item.productId === product.productId)

        if (existingItem) {
            setCart(cart.map(item =>
                item.productId === product.productId
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
    function increaseQuantity(productId) {
        setCart(cart.map(item =>
            item.productId === productId
                ? { ...item, quantity: item.quantity + 1 }
                : item
        ))
    }

    function decreaseQuantity(productId) {
        setCart(cart
            .map(item =>
                item.productId === productId
                    ? { ...item, quantity: item.quantity - 1 }
                    : item
            )
            .filter(item => item.quantity > 0)
        )
    }
    const cartTotal = cart.reduce((sum, item) => sum + item.basePrice * item.quantity, 0)

    if (showCart) {
        return (
            <div>
                <nav
                    style={{
                        backgroundColor: "#111",
                        color: "white",
                        padding: "20px",
                        display: "flex",
                        justifyContent: "space-between"
                    }}
                >
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
                            style={{
                                marginRight: "20px",
                                cursor: "pointer"
                            }}
                        >
                            Home
                        </span>

                        <span style={{ cursor: "pointer" }}>
                            Cart ({cart.length})
                        </span>
                    </div>                </nav>

                <section
                    style={{
                        padding: "40px",
                        maxWidth: "900px",
                        margin: "0 auto"
                    }}
                >
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
                                        marginBottom: "20px"
                                    }}
                                >
                                    <h3>{item.name}</h3>
                                    <p>{item.description}</p>
                                    <h2>{item.basePrice} kr</h2>
                                    <div style={{ marginBottom: "10px" }}>
                                        <button
                                            onClick={() => decreaseQuantity(item.productId)}
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
                                            onClick={() => increaseQuantity(item.productId)}
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

                <section style={{
                    padding: "80px",
                    textAlign: "center"
                }}>
                    <h1>Checkout</h1>

                    <p style={{ marginTop: "20px" }}>
                        Total Amount: {cartTotal} kr
                    </p>
                    <div
                        style={{
                            marginTop: "30px",
                            display: "flex",
                            flexDirection: "column",
                            gap: "15px",
                            maxWidth: "400px",
                            marginLeft: "auto",
                            marginRight: "auto"
                        }}
                    >
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
                        onClick={() => {
                            if (!customerName || !customerEmail || !customerAddress) {
                                alert("Please fill in all checkout fields.")
                                return
                            }

                            if (!customerEmail.includes("@")) {
                                alert("Please enter a valid email address.")
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
                        }}
                        >
                            Complete Purchase
                        </button>
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
                    <h2 style={{ color: "white", cursor: "pointer" }} onClick={() => setSelectedProduct(null)}>
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
                        src={selectedProduct.imageUrl}
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
                                <p>Stock: {variant.stockQuantity}</p>
                                <p>Price: {variant.price} kr</p>
                            </div>
                        ))}

                        <button
                            onClick={() => addToCart(selectedProduct)}
                            style={{
                            marginTop: "20px",
                            padding: "15px 30px",
                            backgroundColor: "black",
                            color: "white",
                            border: "none",
                            cursor: "pointer",
                            fontSize: "16px"
                        }}>
                            Add to Cart
                        </button>
                    </div>
                </section>
            </div>
        )
    }

    return (
        <div>
            <nav
                style={{
                    backgroundColor: "#111",
                    color: "white",
                    padding: "20px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center"
                }}
            >
                <h2 style={{ color: "white" }}>TeeCraft</h2>

                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        border: "1px solid #777",
                        padding: "8px 12px",
                        width: "320px",
                        backgroundColor: "transparent",
                        marginLeft: "120px"
                    }}
                >
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
                    <span
                        onClick={() => setShowCart(true)}
                        style={{ cursor: "pointer" }}
                    >
                        Cart ({cart.length})
                    </span>
                </div>
            </nav>

            <section
                style={{
                    padding: "80px",
                    textAlign: "center"
                }}
            >
                <h1 style={{ fontSize: "60px" }}>Premium T-Shirts</h1>
                <p style={{ fontSize: "20px" }}>T-shirts for modern fashion.</p>
                <button
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

                <div style={{
                    display: "flex",
                    gap: "25px",
                    justifyContent: "center",
                    flexWrap: "wrap"
                }}>
                    {products
                        .filter(product =>
                            product.name.toLowerCase().includes(searchTerm.toLowerCase())
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
                                src={product.imageUrl}
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