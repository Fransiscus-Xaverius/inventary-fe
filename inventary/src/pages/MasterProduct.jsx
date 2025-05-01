import useApiRequest from "../hooks/useApiRequest";
import { useSearchParams } from "react-router-dom";

export default function MasterProduct() {
	// Get query parameters from URL
	const [searchParams] = useSearchParams();
	const offset = searchParams.get("offset") || 0;
	const limit = searchParams.get("limit") || 10;

	const { data, isLoading, error } = useApiRequest({
		url: `/api/products?offset=${offset}&limit=${limit}`,
		queryKey: ["products", offset, limit],
	});

	if (isLoading) return <div>Loading...</div>;
	if (error) return <div>Error loading products</div>;

	const { page, products, total_page: totalPage } = data || {};

	return (
		<div>
			<h1>Master Product</h1>
			{page && <div>Page: {page}</div>}
			{totalPage && <div>Total Page: {totalPage}</div>}
			{products && products.length === 0 && <div>No products found</div>}
			{data &&
				data.products &&
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
