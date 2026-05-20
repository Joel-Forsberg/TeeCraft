import { useEffect, useState } from "react"

function App() {
    const [products, setProducts] = useState([])
    const [selectedProduct, setSelectedProduct] = useState(null)
    const [cart, setCart] = useState([])
    const [showCart, setShowCart] = useState(false)

    useEffect(() => {
        fetch("https://localhost:7042/api/Products?page=1&pageSize=10")
            .then(response => response.json())
            .then(data => {
                setProducts(data.items)
            })
    }, [])
    function addToCart(product) {
        setCart([...cart, product])
        alert(product.name + " added to cart")
    }

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
                        style={{ cursor: "pointer" }}
                        onClick={() => setShowCart(false)}
                    >
                        TeeCraft
                    </h2>

                    <span>Cart ({cart.length})</span>
                </nav>

                <section
                    style={{
                        padding: "40px",
                        maxWidth: "900px",
                        margin: "0 auto"
                    }}
                >
                    <h1>Your Cart</h1>

                    {cart.length === 0 ? (
                        <p>Your cart is empty.</p>
                    ) : (
                        cart.map((item, index) => (
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
                            </div>
                        ))
                    )}
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

                    <span style={{ color: "white" }}>
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
            <nav style={{
                backgroundColor: "#111",
                color: "white",
                padding: "20px",
                display: "flex",
                justifyContent: "space-between"
            }}>
                <h2 style={{ color: "white" }}>TeeCraft</h2>

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

                <div style={{
                    display: "flex",
                    gap: "25px",
                    justifyContent: "center",
                    flexWrap: "wrap"
                }}>
                    {products.map(product => (
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