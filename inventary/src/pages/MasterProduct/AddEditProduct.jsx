import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import { DevTool } from "@hookform/devtools";
import { joiResolver } from "@hookform/resolvers/joi";
import Joi from "joi";
import SidebarDashboard from "../../components/SidebarDashboard";
import useApiRequest from "../../hooks/useApiRequest";
import {
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	IconButton,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

// Size pattern validator for EU sizes or ranges (e.g., 30 or 30-38)
const sizePattern = Joi.string().pattern(/^(\d+(-\d+)?)(,\s*\d+(-\d+)?)*$/);

// Validation schema with Joi
const productSchema = Joi.object({
	artikel: Joi.string().required().messages({
		"string.empty": "Artikel tidak boleh kosong",
		"any.required": "Artikel harus diisi",
	}),
	warna: Joi.array().min(1).required().messages({
		"array.min": "Pilih minimal 1 warna",
		"any.required": "Warna harus diisi",
	}),
	size: sizePattern.required().messages({
		"string.empty": "Ukuran tidak boleh kosong",
		"string.pattern.base":
			"Format ukuran harus berupa angka (mis: 30) atau rentang (mis: 30-38)",
		"any.required": "Ukuran harus diisi",
	}),
	grup: Joi.string().required().messages({
		"string.empty": "Grup tidak boleh kosong",
		"any.required": "Grup harus diisi",
	}),
	unit: Joi.string().required().messages({
		"string.empty": "Unit tidak boleh kosong",
		"any.required": "Unit harus diisi",
	}),
	kat: Joi.string().required().messages({
		"string.empty": "Kategori tidak boleh kosong",
		"any.required": "Kategori harus diisi",
	}),
	model: Joi.string().required().messages({
		"string.empty": "Model tidak boleh kosong",
		"any.required": "Model harus diisi",
	}),
	gender: Joi.string().required().messages({
		"string.empty": "Gender tidak boleh kosong",
		"any.required": "Gender harus diisi",
	}),
	tipe: Joi.string().required().messages({
		"string.empty": "Tipe tidak boleh kosong",
		"any.required": "Tipe harus diisi",
	}),
	harga: Joi.number().positive().required().messages({
		"number.base": "Harga harus berupa angka",
		"number.positive": "Harga harus lebih dari 0",
		"any.required": "Harga harus diisi",
	}),
	tanggal_produk: Joi.date().iso().allow("").optional(),
	tanggal_terima: Joi.date().iso().allow("").optional(),
	status: Joi.string()
		.valid("Active", "Inactive", "Discontinued")
		.required()
		.messages({
			"string.empty": "Status tidak boleh kosong",
			"any.required": "Status harus diisi",
			"any.only": "Status harus Active, Inactive, atau Discontinued",
		}),
	supplier: Joi.string().required().messages({
		"string.empty": "Supplier tidak boleh kosong",
		"any.required": "Supplier harus diisi",
	}),
	diupdate_oleh: Joi.string().required().messages({
		"string.empty": "Diupdate oleh tidak boleh kosong",
		"any.required": "Diupdate oleh harus diisi",
	}),
});

export default function AddEditProduct() {
	const { artikel } = useParams();
	const navigate = useNavigate();
	const isEdit = !!artikel;
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [submitError, setSubmitError] = useState("");
	const [selectedColors, setSelectedColors] = useState([]);
	const [colorModalOpen, setColorModalOpen] = useState(false);
	const [colorSelections, setColorSelections] = useState([""]);

	// Fetch color options from API
	const { response: colorsResponse, isLoading: isLoadingColors } =
		useApiRequest({
			url: "/api/colors",
			queryKey: ["colors"],
		});

	// Fetch grup options from API
	const { response: grupsResponse, isLoading: isLoadingGrups } = useApiRequest({
		url: "/api/grups",
		queryKey: ["grups"],
	});

	// Fetch unit options from API
	const { response: unitsResponse, isLoading: isLoadingUnits } = useApiRequest({
		url: "/api/units",
		queryKey: ["units"],
	});

	// Fetch kategori options from API
	const { response: katsResponse, isLoading: isLoadingKats } = useApiRequest({
		url: "/api/kats",
		queryKey: ["kats"],
	});

	// Fetch gender options from API
	const { response: gendersResponse, isLoading: isLoadingGenders } =
		useApiRequest({
			url: "/api/genders",
			queryKey: ["genders"],
		});

	// Fetch tipe options from API
	const { response: tipesResponse, isLoading: isLoadingTipes } = useApiRequest({
		url: "/api/tipes",
		queryKey: ["tipes"],
	});

	// Extract options from API responses
	const colors = colorsResponse?.data.colors || [];
	const grups = grupsResponse?.data.grups || [];
	const units = unitsResponse?.data.units || [];
	const kats = katsResponse?.data.kats || [];
	const genders = gendersResponse?.data.genders || [];
	const tipes = tipesResponse?.data.tipes || [];

	const statuses = ["Active", "Inactive", "Discontinued"];

	// API request for getting product data (only enabled when editing)
	const {
		response: productResponse,
		isLoading,
		error,
	} = useApiRequest({
		url: `/api/products/${artikel}`,
		queryKey: ["product", "artikel", artikel],
		enableQuery: isEdit,
	});

	// Use react-hook-form with joi validation
	const {
		control,
		handleSubmit,
		formState: { errors },
		reset,
		setValue,
		watch,
		register,
	} = useForm({
		resolver: joiResolver(productSchema),
		defaultValues: {
			artikel: "",
			warna: [],
			size: "",
			grup: "",
			unit: "",
			kat: "",
			model: "",
			gender: "",
			tipe: "",
			harga: "",
			tanggal_produk: "",
			tanggal_terima: "",
			status: "",
			supplier: "",
			diupdate_oleh: "",
		},
	});

	// Fill the form with existing data when editing
	useEffect(() => {
		if (
			isEdit &&
			productResponse &&
			grups.length > 0 &&
			units.length > 0 &&
			kats.length > 0 &&
			genders.length > 0 &&
			tipes.length > 0
		) {
			const productData = productResponse?.data || {};
			console.log("[Edit Mode] Product data from API:", productData);

			const stringify = (id) => id?.toString() || ""; // Helper to stringify ID or return empty string

			// Prepare values for react-hook-form's reset function
			const valuesToReset = {
				artikel: productData.artikel || "",
				warna: [], // Handled by setSelectedColors and custom color picker logic
				size: productData.size || "",
				grup: stringify(
					grups.find((grup) => grup.value === productData.grup)?.id
				),
				unit: stringify(
					units.find((unit) => unit.value === productData.unit)?.id
				),
				kat: stringify(kats.find((kat) => kat.value === productData.kat)?.id),
				model: productData.model || "",
				gender: stringify(
					genders.find((gender) => gender.value === productData.gender)?.id
				),
				tipe: stringify(
					tipes.find((tipe) => tipe.value === productData.tipe)?.id
				),
				harga: productData.harga !== undefined ? Number(productData.harga) : "",
				tanggal_produk: productData.tanggal_produk
					? productData.tanggal_produk.split("T")[0]
					: "",
				tanggal_terima: productData.tanggal_terima
					? productData.tanggal_terima.split("T")[0]
					: "",
				status: productData.status
					? productData.status.charAt(0).toUpperCase() +
					  productData.status.slice(1).toLowerCase()
					: "",
				supplier: productData.supplier || "",
				diupdate_oleh: productData.diupdate_oleh || "",
			};

			// Handle 'warna' separately for the checkbox state
			let warnaIdsFromApi = productData.warna;
			if (typeof warnaIdsFromApi === "string") {
				warnaIdsFromApi = warnaIdsFromApi.split(",").map((id) => id.trim());
			}
			setSelectedColors(warnaIdsFromApi || []);
			valuesToReset.warna = warnaIdsFromApi || []; // Also set for RHF if it needs to track it, though UI is custom

			console.log("[Edit Mode] Values prepared for reset:", valuesToReset);
			reset(valuesToReset);
			console.log("[Edit Mode] Form reset completed.");
		}
	}, [
		isEdit,
		productResponse,
		reset,
		grups,
		units,
		kats,
		genders,
		tipes,
		setSelectedColors,
	]);

	// If editing, set artikel field to the URL parameter value on first render
	useEffect(() => {
		if (isEdit) {
			setValue("artikel", artikel);
		}
	}, [isEdit, artikel, setValue]);

	// API mutation for submitting form
	const { mutate, isLoading: isMutating } = useApiRequest({
		url: isEdit
			? `/api/products/${productResponse?.data?.artikel || artikel}`
			: "/api/products",
		method: isEdit ? "PUT" : "POST",
	});

	// Form submission handler
	const onSubmit = (data) => {
		setIsSubmitting(true);
		setSubmitError("");

		// Format dates to ISO strings for API
		const formatDateForApi = (dateValue) => {
			if (!dateValue) return "";

			// If dateValue is already a date object (react-hook-form might convert it)
			if (dateValue instanceof Date) {
				// Format to YYYY-MM-DD
				const year = dateValue.getFullYear();
				const month = String(dateValue.getMonth() + 1).padStart(2, "0");
				const day = String(dateValue.getDate()).padStart(2, "0");
				return `${year}-${month}-${day}T00:00:00Z`;
			}

			// If dateValue is a string, ensure it's in the right format
			if (typeof dateValue === "string") {
				// If it already contains time information, strip it
				const datePart = dateValue.split("T")[0];
				// Ensure the string is in YYYY-MM-DD format
				if (/^\d{4}-\d{2}-\d{2}$/.test(datePart)) {
					return `${datePart}T00:00:00Z`;
				}
			}

			// Fallback - attempt to create a new date and format it
			try {
				const date = new Date(dateValue);
				if (!isNaN(date.getTime())) {
					// Check if date is valid
					const year = date.getFullYear();
					const month = String(date.getMonth() + 1).padStart(2, "0");
					const day = String(date.getDate()).padStart(2, "0");
					return `${year}-${month}-${day}T00:00:00Z`;
				}
			} catch (e) {
				console.error("Error formatting date:", e);
			}

			return ""; // Return empty string if all else fails
		};

		console.log("[Submit] Form data received by onSubmit:", data);

		// Process data for API submission
		// 'data' should now contain the correct IDs for dropdown fields from react-hook-form state
		const processedData = {
			artikel: data.artikel,
			warna: Array.isArray(data.warna) ? data.warna.join(",") : data.warna, // Assuming 'warna' in form state is array of IDs
			size: data.size,
			grup: data.grup, // Should be ID string e.g., "1"
			unit: data.unit, // Should be ID string
			kat: data.kat, // Should be ID string
			model: data.model,
			gender: data.gender, // Should be ID string
			tipe: data.tipe, // Should be ID string
			harga: Number(data.harga),
			tanggal_produk: formatDateForApi(data.tanggal_produk),
			tanggal_terima: formatDateForApi(data.tanggal_terima),
			status: data.status ? data.status.toLowerCase() : "", // Ensure lowercase for API
			supplier: data.supplier,
			diupdate_oleh: data.diupdate_oleh,
		};

		console.log("[Submit] Processed data (to be sent to API):", processedData);

		mutate(processedData, {
			onSuccess: () => {
				alert(`${isEdit ? "Updated" : "Added"} product successfully!`);
				navigate("/master-product");
			},
			onError: (error) => {
				console.error("Error submitting form:", error);
				setSubmitError(
					error.response.data.error ||
						"Failed to save product. Please try again."
				);
			},
			onSettled: () => {
				setIsSubmitting(false);
			},
		});
	};

	// Handle color selection modal
	const openColorModal = () => {
		// Initialize color selections with current selections or empty array with one dropdown
		if (selectedColors.length > 0) {
			setColorSelections(selectedColors.map((id) => id));
		} else {
			setColorSelections([""]);
		}
		setColorModalOpen(true);
	};

	const closeColorModal = () => {
		setColorModalOpen(false);
	};

	const handleAddColorDropdown = () => {
		setColorSelections([...colorSelections, ""]);
	};

	const handleColorSelectionChange = (index, colorId) => {
		const newSelections = [...colorSelections];
		newSelections[index] = colorId;
		setColorSelections(newSelections);
	};

	const handleRemoveColorDropdown = (index) => {
		const newSelections = [...colorSelections];
		newSelections.splice(index, 1);
		setColorSelections(newSelections);
	};

	const saveColorSelections = () => {
		// Filter out empty selections and duplicates
		const validSelections = colorSelections
			.filter((id) => id !== "")
			.filter((id, index, self) => self.indexOf(id) === index);

		setSelectedColors(validSelections);
		setValue("warna", validSelections, { shouldValidate: true });
		closeColorModal();
	};

	// Get color info by ID
	const getColorById = (colorId) => {
		return colors.find((color) => color.id === parseInt(colorId));
	};

	// Show loading state when fetching necessary data
	if (
		(isEdit && isLoading) ||
		isLoadingColors ||
		isLoadingGrups ||
		isLoadingUnits ||
		isLoadingKats ||
		isLoadingGenders ||
		isLoadingTipes
	) {
		return (
			<div className='flex min-h-screen bg-gray-100'>
				<SidebarDashboard />
				<div className='flex-1 p-6 flex items-center justify-center'>
					<p className='text-gray-500'>Loading data...</p>
				</div>
			</div>
		);
	}

	// Show error if product data couldn't be fetched
	if (isEdit && error) {
		return (
			<div className='flex min-h-screen bg-gray-100'>
				<SidebarDashboard />
				<div className='flex-1 p-6'>
					<div className='bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded'>
						<p>Could not load product data. Please try again later.</p>
						<button
							onClick={() => navigate("/master-product")}
							className='mt-2 bg-red-100 hover:bg-red-200 text-red-800 px-3 py-1 rounded'
						>
							Back to Products
						</button>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className='flex min-h-screen bg-gray-100'>
			<SidebarDashboard />
			<div className='flex-1 p-6'>
				<h1 className='text-2xl font-bold mb-4'>
					{isEdit ? "Edit Product" : "Add Product"}
				</h1>

				{submitError && (
					<div className='bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4'>
						{submitError}
					</div>
				)}

				<form
					onSubmit={handleSubmit(onSubmit)}
					className='grid grid-cols-1 md:grid-cols-2 gap-4 bg-white p-6 rounded shadow'
				>
					{/* Artikel */}
					<div className='flex flex-col'>
						<label
							htmlFor='artikel'
							className='mb-1 font-medium text-sm text-gray-700'
						>
							Artikel
						</label>
						<Controller
							name='artikel'
							control={control}
							render={({ field }) => (
								<input
									{...field}
									type='text'
									id='artikel'
									className={`border ${
										errors.artikel ? "border-red-300" : "border-gray-300"
									} rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500`}
									readOnly={isEdit} // Make readonly when editing
								/>
							)}
						/>
						{errors.artikel && (
							<p className='mt-1 text-sm text-red-600'>
								{errors.artikel.message}
							</p>
						)}
					</div>

					{/* Warna */}
					<div className='flex flex-col'>
						<label className='mb-1 font-medium text-sm text-gray-700'>
							Warna
						</label>
						<div
							onClick={openColorModal}
							className='border border-gray-300 rounded p-3 min-h-12 cursor-pointer hover:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500'
						>
							{selectedColors.length > 0 ? (
								<div className='flex flex-wrap gap-2'>
									{selectedColors.map((colorId) => {
										const color = getColorById(colorId);
										console.log("Colors: ", colors);
										console.log("Color: ", color);

										return color ? (
											<div key={color.id} className='flex items-center'>
												<div
													className='w-6 h-6 mr-1 border border-gray-300 rounded-sm'
													style={{ backgroundColor: color.hex }}
													title={color.nama}
												></div>
											</div>
										) : null;
									})}
								</div>
							) : (
								<span className='text-gray-500'>Klik untuk memilih warna</span>
							)}
						</div>
						{errors.warna && (
							<p className='mt-1 text-sm text-red-600'>
								{errors.warna.message}
							</p>
						)}
					</div>

					{/* Color Selection Modal */}
					<Dialog
						open={colorModalOpen}
						onClose={closeColorModal}
						maxWidth='sm'
						fullWidth
					>
						<DialogTitle>
							Daftar Warna
							<IconButton
								aria-label='close'
								onClick={closeColorModal}
								sx={{
									position: "absolute",
									right: 8,
									top: 8,
								}}
							>
								<CloseIcon />
							</IconButton>
						</DialogTitle>
						<DialogContent dividers>
							<div className='flex flex-col space-y-3'>
								{colorSelections.map((selectedId, index) => (
									<div key={index} className='flex items-center space-x-2'>
										<select
											value={selectedId}
											onChange={(e) =>
												handleColorSelectionChange(index, e.target.value)
											}
											className='flex-1 border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500'
										>
											<option value=''>Pilih warna</option>
											{colors
												.filter(
													(color) =>
														// Show color if it's the current selection or not selected in other dropdowns
														color.id === selectedId ||
														!colorSelections.includes(color.id) ||
														colorSelections.indexOf(color.id) === index
												)
												.map((color) => (
													<option key={color.id} value={color.id}>
														{color.nama}
													</option>
												))}
										</select>

										{/* Color preview */}
										{selectedId && (
											<div
												className='w-8 h-8 border border-gray-300 rounded-sm'
												style={{
													backgroundColor:
														getColorById(selectedId)?.hex || "#FFFFFF",
												}}
											></div>
										)}

										{/* Remove button */}
										{colorSelections.length > 1 && (
											<button
												type='button'
												onClick={() => handleRemoveColorDropdown(index)}
												className='text-red-600 hover:text-red-800'
											>
												&times;
											</button>
										)}
									</div>
								))}

								{/* Add button */}
								<button
									type='button'
									onClick={handleAddColorDropdown}
									className='mt-2 self-start bg-gray-200 hover:bg-gray-300 text-gray-800 px-3 py-1 rounded flex items-center'
								>
									<span className='text-lg mr-1'>+</span> Add Color
								</button>
							</div>
						</DialogContent>
						<DialogActions>
							<button
								type='button'
								onClick={closeColorModal}
								className='text-gray-600 hover:text-gray-800 px-4 py-2'
							>
								Cancel
							</button>
							<button
								type='button'
								onClick={saveColorSelections}
								className='bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded'
							>
								Save
							</button>
						</DialogActions>
					</Dialog>

					{/* Size */}
					<div className='flex flex-col'>
						<label
							htmlFor='size'
							className='mb-1 font-medium text-sm text-gray-700'
						>
							Size (Comma-separated, e.g. 30,32-38,42)
						</label>
						<Controller
							name='size'
							control={control}
							render={({ field }) => (
								<input
									{...field}
									type='text'
									id='size'
									placeholder='30,32-38,42'
									className={`border ${
										errors.size ? "border-red-300" : "border-gray-300"
									} rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500`}
								/>
							)}
						/>
						{errors.size && (
							<p className='mt-1 text-sm text-red-600'>{errors.size.message}</p>
						)}
					</div>

					{/* Grup */}
					<div className='flex flex-col'>
						<label
							htmlFor='grup'
							className='mb-1 font-medium text-sm text-gray-700'
						>
							Grup
						</label>
						<Controller
							name='grup'
							control={control}
							render={({ field }) => (
								<select
									{...field}
									id='grup'
									value={field.value}
									className={`border ${
										errors.grup ? "border-red-300" : "border-gray-300"
									} rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500`}
								>
									<option value=''>Pilih Grup</option>
									{grups.map((grup) => (
										<option key={grup.id} value={grup.id.toString()}>
											{grup.value}
										</option>
									))}
								</select>
							)}
						/>
						{errors.grup && (
							<p className='mt-1 text-sm text-red-600'>{errors.grup.message}</p>
						)}
					</div>

					{/* Unit */}
					<div className='flex flex-col'>
						<label
							htmlFor='unit'
							className='mb-1 font-medium text-sm text-gray-700'
						>
							Unit
						</label>
						<Controller
							name='unit'
							control={control}
							render={({ field }) => (
								<select
									{...field}
									id='unit'
									className={`border ${
										errors.unit ? "border-red-300" : "border-gray-300"
									} rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500`}
								>
									<option value=''>Pilih Unit</option>
									{units.map((unit) => (
										<option key={unit.id} value={unit.id.toString()}>
											{unit.value}
										</option>
									))}
								</select>
							)}
						/>
						{errors.unit && (
							<p className='mt-1 text-sm text-red-600'>{errors.unit.message}</p>
						)}
					</div>

					{/* Kategori */}
					<div className='flex flex-col'>
						<label
							htmlFor='kat'
							className='mb-1 font-medium text-sm text-gray-700'
						>
							Kategori
						</label>
						<Controller
							name='kat'
							control={control}
							render={({ field }) => (
								<select
									{...field}
									id='kat'
									className={`border ${
										errors.kat ? "border-red-300" : "border-gray-300"
									} rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500`}
								>
									<option value=''>Pilih Kategori</option>
									{kats.map((kat) => (
										<option key={kat.id} value={kat.id.toString()}>
											{kat.value}
										</option>
									))}
								</select>
							)}
						/>
						{errors.kat && (
							<p className='mt-1 text-sm text-red-600'>{errors.kat.message}</p>
						)}
					</div>

					{/* Model (Required) */}
					<div className='flex flex-col'>
						<label
							htmlFor='model'
							className='mb-1 font-medium text-sm text-gray-700'
						>
							Model
						</label>
						<Controller
							name='model'
							control={control}
							render={({ field }) => (
								<input
									{...field}
									type='text'
									id='model'
									className={`border ${
										errors.model ? "border-red-300" : "border-gray-300"
									} rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500`}
								/>
							)}
						/>
						{errors.model && (
							<p className='mt-1 text-sm text-red-600'>
								{errors.model.message}
							</p>
						)}
					</div>

					{/* Gender */}
					<div className='flex flex-col'>
						<label
							htmlFor='gender'
							className='mb-1 font-medium text-sm text-gray-700'
						>
							Gender
						</label>
						<Controller
							name='gender'
							control={control}
							render={({ field }) => (
								<select
									{...field}
									id='gender'
									className={`border ${
										errors.gender ? "border-red-300" : "border-gray-300"
									} rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500`}
								>
									<option value=''>Pilih Gender</option>
									{genders.map((gender) => (
										<option key={gender.id} value={gender.id.toString()}>
											{gender.value}
										</option>
									))}
								</select>
							)}
						/>
						{errors.gender && (
							<p className='mt-1 text-sm text-red-600'>
								{errors.gender.message}
							</p>
						)}
					</div>

					{/* Tipe */}
					<div className='flex flex-col'>
						<label
							htmlFor='tipe'
							className='mb-1 font-medium text-sm text-gray-700'
						>
							Tipe
						</label>
						<Controller
							name='tipe'
							control={control}
							render={({ field }) => (
								<select
									{...field}
									id='tipe'
									className={`border ${
										errors.tipe ? "border-red-300" : "border-gray-300"
									} rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500`}
								>
									<option value=''>Pilih Tipe</option>
									{tipes.map((tipe) => (
										<option key={tipe.id} value={tipe.id.toString()}>
											{tipe.value}
										</option>
									))}
								</select>
							)}
						/>
						{errors.tipe && (
							<p className='mt-1 text-sm text-red-600'>{errors.tipe.message}</p>
						)}
					</div>

					{/* Harga */}
					<div className='flex flex-col'>
						<label
							htmlFor='harga'
							className='mb-1 font-medium text-sm text-gray-700'
						>
							Harga
						</label>
						<Controller
							name='harga'
							control={control}
							render={({ field: { onChange, value, ...field } }) => (
								<input
									{...field}
									type='number'
									id='harga'
									value={value}
									onChange={(e) =>
										onChange(
											e.target.value === "" ? "" : Number(e.target.value)
										)
									}
									step='0.1'
									className={`border ${
										errors.harga ? "border-red-300" : "border-gray-300"
									} rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500`}
								/>
							)}
						/>
						{errors.harga && (
							<p className='mt-1 text-sm text-red-600'>
								{errors.harga.message}
							</p>
						)}
					</div>

					{/* Tanggal Produk (Optional) */}
					<div className='flex flex-col'>
						<label
							htmlFor='tanggal_produk'
							className='mb-1 font-medium text-sm text-gray-700'
						>
							Tanggal Produk (Optional)
						</label>
						<Controller
							name='tanggal_produk'
							control={control}
							render={({ field }) => (
								<input
									{...field}
									type='date'
									id='tanggal_produk'
									className='border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500'
								/>
							)}
						/>
					</div>

					{/* Tanggal Diterima (Optional) */}
					<div className='flex flex-col'>
						<label
							htmlFor='tanggal_terima'
							className='mb-1 font-medium text-sm text-gray-700'
						>
							Tanggal Diterima (Optional)
						</label>
						<Controller
							name='tanggal_terima'
							control={control}
							render={({ field }) => (
								<input
									{...field}
									type='date'
									id='tanggal_terima'
									className='border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500'
								/>
							)}
						/>
					</div>

					{/* Status */}
					<div className='flex flex-col'>
						<label
							htmlFor='status'
							className='mb-1 font-medium text-sm text-gray-700'
						>
							Status
						</label>
						<Controller
							name='status'
							control={control}
							render={({ field }) => (
								<select
									{...field}
									id='status'
									className={`border ${
										errors.status ? "border-red-300" : "border-gray-300"
									} rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500`}
								>
									<option value=''>Pilih Status</option>
									{statuses.map((status) => (
										<option key={status} value={status}>
											{status}
										</option>
									))}
								</select>
							)}
						/>
						{errors.status && (
							<p className='mt-1 text-sm text-red-600'>
								{errors.status.message}
							</p>
						)}
					</div>

					{/* Supplier */}
					<div className='flex flex-col'>
						<label
							htmlFor='supplier'
							className='mb-1 font-medium text-sm text-gray-700'
						>
							Supplier
						</label>
						<Controller
							name='supplier'
							control={control}
							render={({ field }) => (
								<input
									{...field}
									type='text'
									id='supplier'
									className={`border ${
										errors.supplier ? "border-red-300" : "border-gray-300"
									} rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500`}
								/>
							)}
						/>
						{errors.supplier && (
							<p className='mt-1 text-sm text-red-600'>
								{errors.supplier.message}
							</p>
						)}
					</div>

					{/* Diupdate Oleh */}
					<div className='flex flex-col'>
						<label
							htmlFor='diupdate_oleh'
							className='mb-1 font-medium text-sm text-gray-700'
						>
							Diupdate Oleh
						</label>
						<Controller
							name='diupdate_oleh'
							control={control}
							render={({ field }) => (
								<input
									{...field}
									type='text'
									id='diupdate_oleh'
									className={`border ${
										errors.diupdate_oleh ? "border-red-300" : "border-gray-300"
									} rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500`}
								/>
							)}
						/>
						{errors.diupdate_oleh && (
							<p className='mt-1 text-sm text-red-600'>
								{errors.diupdate_oleh.message}
							</p>
						)}
					</div>

					{/* Submit Button */}
					<div className='md:col-span-2 text-right'>
						<button
							type='submit'
							disabled={isSubmitting || isMutating}
							className={`${
								isSubmitting || isMutating
									? "bg-indigo-400"
									: "bg-indigo-600 hover:bg-indigo-700"
							} text-white px-6 py-2 rounded transition`}
						>
							{isSubmitting || isMutating
								? "Saving..."
								: isEdit
								? "Update Product"
								: "Add Product"}
						</button>
					</div>
				</form>
			</div>
			<DevTool control={control} /> {/* set up the dev tool */}
		</div>
	);
}
