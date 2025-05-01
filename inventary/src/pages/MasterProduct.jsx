import useApiRequest from "../hooks/useApiRequest";

export default function MasterProduct() {
	const { data, isLoading, error } = useApiRequest({
		url: "/api/products",
		queryKey: ["products"],
	});

	if (isLoading) return <div>Loading...</div>;
	if (error) return <div>Error loading products</div>;

	return (
		<div>
			{data.products &&
				data.products.map((product) => (
					<div key={product.id}>
						{product.artikel}, {product.warna}, {product.size}, {product.grup},{" "}
						{product.unit}, {product.kat}, {product.model}, {product.gender},{" "}
						{product.tipe}, Rp {product.harga}, {product.tanggal_produk},{" "}
						{product.tanggal_terima}, {product.usia}, {product.status},{" "}
						{product.supplier}, {product.diupdate_oleh},{" "}
						{product.tanggal_update}
					</div>
				))}
		</div>
	);
}
