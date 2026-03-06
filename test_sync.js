const expectedProducts = [
    { id: 1, name: "Test Product", price: "10€", category: "men", link: "https://example.com" }
];

try {
    // Simulate encoding (btoa in browser)
    const dataStr = Buffer.from(JSON.stringify(expectedProducts)).toString('base64');
    console.log("Encoded:", dataStr);

    // Simulate decoding (atob in browser)
    const decodedStr = Buffer.from(dataStr, 'base64').toString('utf-8');
    const decodedProducts = JSON.parse(decodedStr);

    if (JSON.stringify(expectedProducts) === JSON.stringify(decodedProducts)) {
        console.log("Verification SUCCESS: Encoding and decoding work as expected.");
    } else {
        console.error("Verification FAILED: Decoded data does not match original.");
    }
} catch (e) {
    console.error("Verification FAILED with error:", e.message);
}
