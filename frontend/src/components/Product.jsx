import {
  useCallback,
  useEffect,
  useState,
} from 'react';
import Header from './Header';
import { api } from '../api/api';

const EMPTY_FORM = {
  proName: '',
  category: '',
  price: '',
  company: '',
  companyPhone: '',
  proDescription: '',
};

const RECOMMENDED_PRODUCT_NAMES = [
  '유기질 비료',
  '복합 비료',
  '종자',
  '살충제',
  '살균제',
  '제초제'
];

const RECOMMENDED_CATEGORIES = [
  '비료',
  '종자',
  '농약',
  '영양제'
];

const MAX_IMAGE_SIZE =
  10 * 1024 * 1024;

const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
];

export default function Product() {
  const [products, setProducts] =
    useState([]);

  const [allProducts, setAllProducts] =
    useState([]);

  const [categoryOptions, setCategoryOptions] =
    useState([]);

  const [form, setForm] =
    useState(EMPTY_FORM);

  const [isCustomProductName, setIsCustomProductName] =
    useState(false);

  const [isCustomCategory, setIsCustomCategory] =
    useState(false);

  const [
    editingProNum,
    setEditingProNum,
  ] = useState(null);

  const [
    deletingProNum,
    setDeletingProNum,
  ] = useState(null);

  const [
    referenceImageFile,
    setReferenceImageFile,
  ] = useState(null);

  const [
    currentReferenceImageUrl,
    setCurrentReferenceImageUrl,
  ] = useState('');

  const [
    localPreviewUrl,
    setLocalPreviewUrl,
  ] = useState('');

  const [
    imageInputKey,
    setImageInputKey,
  ] = useState(0);

  const [keyword, setKeyword] =
    useState('');

  const [
    categoryFilter,
    setCategoryFilter,
  ] = useState('');

  const [isLoading, setIsLoading] =
    useState(true);

  const [isSaving, setIsSaving] =
    useState(false);

  const [
    isDeletingImage,
    setIsDeletingImage,
  ] = useState(false);

  const [errorMessage, setErrorMessage] =
    useState('');

  const [successMessage, setSuccessMessage] =
    useState('');

  /**
   * 선택한 이미지의 로컬 미리보기 주소를 만듭니다.
   */
  useEffect(() => {
    if (!referenceImageFile) {
      setLocalPreviewUrl('');
      return undefined;
    }

    const previewUrl =
      URL.createObjectURL(
        referenceImageFile
      );

    setLocalPreviewUrl(previewUrl);

    return () => {
      URL.revokeObjectURL(previewUrl);
    };
  }, [referenceImageFile]);

  /**
   * 필터가 적용되지 않은 전체 상품 목록을 조회합니다.
   */
  const loadProducts = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage('');

    try {
      const data = await api.get('/products');

      const loadedProducts = Array.isArray(data)
        ? data
        : [];

      setAllProducts(loadedProducts);
    } catch (error) {
      setErrorMessage(
        error.message ||
          '상품 목록을 불러오지 못했습니다.'
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  /**
   * DB에 실제로 등록된 상품의 분류만 선택지로 만듭니다.
   * 현재 선택한 필터와 관계없이 전체 분류를 계속 유지합니다.
   */
  useEffect(() => {
    const registeredCategories = allProducts
      .map((product) =>
        product.category?.trim()
      )
      .filter(Boolean);

    const uniqueCategories = [
      ...new Set(registeredCategories),
    ].sort((first, second) =>
      first.localeCompare(second, 'ko')
    );

    setCategoryOptions(uniqueCategories);

    if (
      categoryFilter &&
      !uniqueCategories.includes(categoryFilter)
    ) {
      setCategoryFilter('');
    }
  }, [allProducts, categoryFilter]);

  /**
   * 전체 상품에서 상품명과 분류 조건을 동시에 적용합니다.
   */
  useEffect(() => {
    const normalizedKeyword =
      keyword.trim().toLowerCase();

    const filteredProducts = allProducts.filter(
      (product) => {
        const productName = String(
          product.proName || ''
        ).toLowerCase();

        const productCategory = String(
          product.category || ''
        ).trim();

        const matchesKeyword =
          !normalizedKeyword ||
          productName.includes(normalizedKeyword);

        const matchesCategory =
          !categoryFilter ||
          productCategory === categoryFilter;

        return matchesKeyword && matchesCategory;
      }
    );

    setProducts(filteredProducts);
  }, [allProducts, keyword, categoryFilter]);

  const displayReferenceImageUrl =
    localPreviewUrl ||
    currentReferenceImageUrl;

  const handleFormChange = (event) => {
    const { name, value } =
      event.target;

    const nextValue =
      name === 'companyPhone'
        ? formatPhoneInput(value)
        : value;

    setForm((previous) => ({
      ...previous,
      [name]: nextValue,
    }));
  };

  const handleProductNameSelect = (productName) => {
    setIsCustomProductName(false);

    setForm((previous) => ({
      ...previous,
      proName: productName,
    }));
  };

  const handleCategorySelect = (category) => {
    setIsCustomCategory(false);

    setForm((previous) => ({
      ...previous,
      category,
    }));
  };

  const handleCustomProductNameSelect = () => {
    setIsCustomProductName(true);

    if (
      RECOMMENDED_PRODUCT_NAMES.includes(
        form.proName
      )
    ) {
      setForm((previous) => ({
        ...previous,
        proName: '',
      }));
    }
  };

  const handleCustomCategorySelect = () => {
    setIsCustomCategory(true);

    if (
      RECOMMENDED_CATEGORIES.includes(
        form.category
      )
    ) {
      setForm((previous) => ({
        ...previous,
        category: '',
      }));
    }
  };

  const handleImageChange = (event) => {
    const imageFile =
      event.target.files?.[0];

    setErrorMessage('');
    setSuccessMessage('');

    if (!imageFile) {
      setReferenceImageFile(null);
      return;
    }

    if (
      !ALLOWED_IMAGE_TYPES.includes(
        imageFile.type
      )
    ) {
      setErrorMessage(
        'JPG, JPEG, PNG, WEBP 형식의 이미지만 등록할 수 있습니다.'
      );

      setReferenceImageFile(null);

      setImageInputKey(
        (previous) => previous + 1
      );

      return;
    }

    if (
      imageFile.size >
      MAX_IMAGE_SIZE
    ) {
      setErrorMessage(
        '참고 이미지는 10MB 이하만 등록할 수 있습니다.'
      );

      setReferenceImageFile(null);

      setImageInputKey(
        (previous) => previous + 1
      );

      return;
    }

    setReferenceImageFile(imageFile);
  };

  const resetForm = () => {
    setForm(EMPTY_FORM);
    setIsCustomProductName(false);
    setIsCustomCategory(false);
    setEditingProNum(null);
    setReferenceImageFile(null);
    setCurrentReferenceImageUrl('');

    setImageInputKey(
      (previous) => previous + 1
    );

    setErrorMessage('');
  };

  const validateForm = () => {
    if (!form.proName.trim()) {
      return '상품명을 입력해주세요.';
    }

    if (!form.category.trim()) {
      return '상품 분류를 입력해주세요.';
    }

    if (form.price === '') {
      return '상품 가격을 입력해주세요.';
    }

    const price = Number(form.price);

    if (
      !Number.isInteger(price) ||
      price < 0
    ) {
      return '상품 가격은 0원 이상의 정수로 입력해주세요.';
    }

    if (!form.company.trim()) {
      return '제조사 또는 판매사를 입력해주세요.';
    }

    const companyPhoneNumbers =
      form.companyPhone.replace(/[^0-9]/g, '');

    if (!companyPhoneNumbers) {
      return '판매 업체 전화번호를 입력해주세요.';
    }

    if (
      companyPhoneNumbers.length < 9 ||
      companyPhoneNumbers.length > 11
    ) {
      return '판매 업체 전화번호를 정확하게 입력해주세요.';
    }

    return '';
  };

  /**
   * 상품 정보와 참고 이미지를 저장합니다.
   */
  const handleSubmit = async (event) => {
    event.preventDefault();

    setErrorMessage('');
    setSuccessMessage('');

    const validationMessage =
      validateForm();

    if (validationMessage) {
      setErrorMessage(validationMessage);
      return;
    }

    const requestBody = {
      proName: form.proName.trim(),
      category: form.category.trim(),
      price: Number(form.price),
      company: form.company.trim(),
      companyPhone:
        form.companyPhone.replace(/[^0-9]/g, ''),
      proDescription:
        form.proDescription.trim(),
    };

    setIsSaving(true);

    let productWasSaved = false;

    try {
      let savedProduct;

      if (editingProNum) {
        savedProduct = await api.patch(
          `/products/${editingProNum}`,
          requestBody
        );
      } else {
        savedProduct = await api.post(
          '/products',
          requestBody
        );
      }

      productWasSaved = true;

      if (referenceImageFile) {
        const formData =
          new FormData();

        formData.append(
          'image',
          referenceImageFile
        );

        savedProduct =
          await api.upload(
            `/products/${savedProduct.proNum}/reference-image`,
            formData
          );
      }

      setSuccessMessage(
        editingProNum
          ? '상품 정보가 수정되었습니다.'
          : '새 상품이 등록되었습니다.'
      );

      setForm(EMPTY_FORM);
      setIsCustomProductName(false);
      setIsCustomCategory(false);
      setEditingProNum(null);
      setReferenceImageFile(null);
      setCurrentReferenceImageUrl('');

      setImageInputKey(
        (previous) => previous + 1
      );

      await loadProducts();
    } catch (error) {
      if (
        productWasSaved &&
        referenceImageFile
      ) {
        setErrorMessage(
          `상품 정보는 저장되었지만 참고 이미지 업로드에 실패했습니다. ${
            error.message || ''
          }`
        );

        await loadProducts();
      } else {
        setErrorMessage(
          error.message ||
            '상품 저장 중 오류가 발생했습니다.'
        );
      }
    } finally {
      setIsSaving(false);
    }
  };

  /**
   * 상품 수정 화면을 엽니다.
   */
  const handleEdit = (product) => {
    setEditingProNum(
      product.proNum
    );

    setForm({
      proName:
        product.proName || '',
      category:
        product.category || '',
      price:
        product.price !== undefined &&
        product.price !== null
          ? String(product.price)
          : '',
      company:
        product.company || '',
      companyPhone:
        formatPhoneInput(
          product.companyPhone || ''
        ),
      proDescription:
        product.proDescription || '',
    });

    setIsCustomProductName(
      Boolean(product.proName) &&
        !RECOMMENDED_PRODUCT_NAMES.includes(
          product.proName
        )
    );

    setIsCustomCategory(
      Boolean(product.category) &&
        !RECOMMENDED_CATEGORIES.includes(
          product.category
        )
    );

    setCurrentReferenceImageUrl(
      product.referenceImageUrl || ''
    );

    setReferenceImageFile(null);

    setImageInputKey(
      (previous) => previous + 1
    );

    setErrorMessage('');
    setSuccessMessage('');

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  /**
   * 상품을 삭제합니다.
   */
  /**
 * 상품과 관련 생성 이미지 및 프롬프트를 삭제합니다.
 *
 * 기존 MMS 발송 내역은 삭제하지 않습니다.
 */
    const handleProductDelete = async (product) => {
    const confirmed = window.confirm(
        `[${product.proName}] 상품을 삭제하시겠습니까?\n\n` +
        '• 해당 상품으로 만든 생성 이미지가 모두 삭제됩니다.\n' +
        '• 이미지 생성에 사용한 프롬프트가 함께 삭제됩니다.\n' +
        '• 등록된 참고 이미지 파일이 삭제됩니다.\n' +
        '• 기존 MMS 발송 내역은 그대로 유지됩니다.\n\n' +
        '삭제한 상품과 생성 이미지는 복구할 수 없습니다.'
    );

    if (!confirmed) {
        return;
    }

    setDeletingProNum(product.proNum);
    setErrorMessage('');
    setSuccessMessage('');

    try {
        const response = await api.delete(
        `/products/${product.proNum}`
        );

        /*
        * 현재 수정 중인 상품을 삭제한 경우
        * 입력 폼도 초기화합니다.
        */
        if (
        Number(editingProNum) ===
        Number(product.proNum)
        ) {
        resetForm();
        }

        setSuccessMessage(
        response?.message ||
            '상품과 관련 생성 이미지가 삭제되었습니다. 기존 MMS 발송 내역은 유지됩니다.'
        );

        /*
        * 삭제가 끝난 뒤 상품 목록을 다시 불러옵니다.
        */
        await loadProducts();
    } catch (error) {
        setErrorMessage(
        error.message ||
            '상품 삭제 중 오류가 발생했습니다.'
        );
    } finally {
        setDeletingProNum(null);
    }
    };

  /**
   * 등록된 참고 이미지만 삭제합니다.
   */
  const handleReferenceImageDelete =
    async () => {
      if (
        !editingProNum ||
        !currentReferenceImageUrl
      ) {
        return;
      }

      const confirmed =
        window.confirm(
          '등록된 참고 이미지를 삭제하시겠습니까?'
        );

      if (!confirmed) {
        return;
      }

      setIsDeletingImage(true);
      setErrorMessage('');
      setSuccessMessage('');

      try {
        await api.delete(
          `/products/${editingProNum}/reference-image`
        );

        setCurrentReferenceImageUrl('');
        setReferenceImageFile(null);

        setImageInputKey(
          (previous) => previous + 1
        );

        setSuccessMessage(
          '참고 이미지가 삭제되었습니다.'
        );

        await loadProducts();
      } catch (error) {
        setErrorMessage(
          error.message ||
            '참고 이미지 삭제 중 오류가 발생했습니다.'
        );
      } finally {
        setIsDeletingImage(false);
      }
    };

  const formatPrice = (price) => {
    if (
      price === undefined ||
      price === null
    ) {
      return '-';
    }

    return `${Number(
      price
    ).toLocaleString('ko-KR')}원`;
  };

  return (
    <div className="min-h-screen bg-slate-100 text-gray-900 flex flex-col font-sans antialiased">
      <Header />

      <main className="max-w-[1360px] mx-auto px-6 lg:px-10 py-10 w-full flex-1">
        <div className="mb-8">
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">
            상품 관리
          </h1>

          <p className="text-gray-700 font-bold mt-2">
            홍보 이미지 제작에 사용할 상품과
            참고 이미지를 등록하고 관리하세요.
          </p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
          <section className="xl:col-span-4 bg-white rounded-3xl border border-gray-200 p-7 shadow-md">
            <div className="border-b border-gray-100 pb-4 mb-6">
              <h2 className="text-xl font-black">
                {editingProNum
                  ? '상품 정보 수정'
                  : '새 상품 등록'}
              </h2>

              <p className="text-sm text-gray-600 font-bold mt-1">
                상품 정보와 참고 이미지를
                입력해주세요.
              </p>
            </div>

            <form
              onSubmit={handleSubmit}
              className="space-y-5"
            >
              <FormInput
                label="상품명"
                id="proName"
                name="proName"
                value={form.proName}
                onChange={handleFormChange}
                placeholder="예) 유기질 비료 20kg"
                maxLength={100}
              />

              <RecommendedChoiceField
                label="상품 분류"
                options={RECOMMENDED_CATEGORIES}
                value={form.category}
                isCustom={isCustomCategory}
                onSelect={handleCategorySelect}
                onCustomSelect={
                  handleCustomCategorySelect
                }
                inputId="category"
                inputName="category"
                onInputChange={handleFormChange}
                inputPlaceholder="상품 분류를 직접 입력해주세요."
                maxLength={50}
              />

              <FormInput
                label="상품 가격"
                id="price"
                name="price"
                type="number"
                value={form.price}
                onChange={handleFormChange}
                placeholder="예) 35000"
                min="0"
              />

              <FormInput
                label="제조사"
                id="company"
                name="company"
                value={form.company}
                onChange={handleFormChange}
                placeholder="예) FarMMS 농자재"
                maxLength={100}
              />

              <FormInput
                label="판매 업체 전화번호"
                id="companyPhone"
                name="companyPhone"
                type="tel"
                value={form.companyPhone}
                onChange={handleFormChange}
                placeholder="예) 010-1234-5678"
                maxLength={13}
                inputMode="numeric"
                helperText="상품 구매 문의를 받을 업체 전화번호를 입력해주세요."
              />

              <div className="space-y-1.5">
                <label
                  htmlFor="proDescription"
                  className="block text-sm font-black"
                >
                  상품 설명
                </label>

                <textarea
                  id="proDescription"
                  name="proDescription"
                  value={form.proDescription}
                  onChange={handleFormChange}
                  placeholder="상품 특징과 장점을 입력해주세요."
                  rows={4}
                  className="w-full px-4 py-3.5 text-sm font-bold border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-emerald-700 resize-none"
                />
              </div>
              <div className="space-y-2">
                <label
                  htmlFor="referenceImage"
                  className="block text-sm font-black"
                >
                  상품 참고 이미지
                  <span className="text-gray-400 ml-1">
                    (선택)
                  </span>
                </label>

                <input
                  key={imageInputKey}
                  type="file"
                  id="referenceImage"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleImageChange}
                  className="block w-full text-sm font-bold file:mr-3 file:px-4 file:py-2.5 file:border-0 file:rounded-xl file:bg-emerald-50 file:text-emerald-800 file:font-black"
                />

                <p className="text-xs text-gray-500 font-bold">
                  JPG, PNG, WEBP · 최대 10MB
                </p>

                {displayReferenceImageUrl && (
                  <div className="rounded-2xl border-2 border-gray-200 overflow-hidden">
                    <img
                      src={
                        displayReferenceImageUrl
                      }
                      alt="상품 참고 이미지"
                      className="w-full h-56 object-contain bg-white"
                    />

                    <div className="flex gap-2 p-3 border-t">
                      {referenceImageFile && (
                        <button
                          type="button"
                          onClick={() => {
                            setReferenceImageFile(
                              null
                            );

                            setImageInputKey(
                              (previous) =>
                                previous + 1
                            );
                          }}
                          className="flex-1 py-2 border rounded-xl text-xs font-black"
                        >
                          선택 취소
                        </button>
                      )}

                      {!referenceImageFile &&
                        currentReferenceImageUrl &&
                        editingProNum && (
                          <button
                            type="button"
                            onClick={
                              handleReferenceImageDelete
                            }
                            disabled={
                              isDeletingImage
                            }
                            className="flex-1 py-2 border border-red-200 text-red-600 rounded-xl text-xs font-black hover:bg-red-50"
                          >
                            {isDeletingImage
                              ? '삭제 중...'
                              : '참고 이미지 삭제'}
                          </button>
                        )}
                    </div>
                  </div>
                )}
              </div>

              {errorMessage && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
                  {errorMessage}
                </div>
              )}

              {successMessage && (
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-800">
                  {successMessage}
                </div>
              )}

              <div className="flex gap-3">
                {editingProNum && (
                  <button
                    type="button"
                    onClick={resetForm}
                    className="w-1/3 py-3.5 border-2 border-gray-200 rounded-2xl font-black"
                  >
                    취소
                  </button>
                )}

                <button
                  type="submit"
                  disabled={isSaving}
                  className={`py-3.5 bg-emerald-700 hover:bg-emerald-800 disabled:bg-gray-400 text-white font-black rounded-2xl ${
                    editingProNum
                      ? 'w-2/3'
                      : 'w-full'
                  }`}
                >
                  {isSaving
                    ? '저장 중...'
                    : editingProNum
                      ? '상품 수정하기'
                      : '상품 등록하기'}
                </button>
              </div>
            </form>
          </section>

          <section className="xl:col-span-8 space-y-5">
            <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-md">
              <div className="flex flex-col md:flex-row gap-3">
                <input
                  type="text"
                  value={keyword}
                  onChange={(event) =>
                    setKeyword(
                      event.target.value
                    )
                  }
                  placeholder="상품명으로 검색"
                  className="flex-1 px-4 py-3.5 border-2 border-gray-200 rounded-2xl font-bold focus:outline-none focus:border-emerald-700"
                />

                <select
                  value={categoryFilter}
                  onChange={(event) =>
                    setCategoryFilter(
                      event.target.value
                    )
                  }
                  className="w-full md:w-52 px-4 py-3.5 border-2 border-gray-200 rounded-2xl font-black bg-white"
                >
                  <option value="">
                    전체 분류
                  </option>

                  {categoryOptions.map(
                    (category) => (
                      <option
                        key={category}
                        value={category}
                      >
                        {category}
                      </option>
                    )
                  )}
                </select>

                <div className="flex items-center justify-center px-5 bg-emerald-50 border border-emerald-200 rounded-2xl">
                  <span className="font-bold">
                    전체
                  </span>

                  <strong className="text-2xl text-emerald-700 mx-2">
                    {products.length}
                  </strong>

                  <span className="font-bold">
                    개
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-3xl border border-gray-200 shadow-md overflow-hidden">
              {isLoading ? (
                <div className="py-20 text-center font-bold text-gray-500">
                  상품 목록을 불러오는 중입니다.
                </div>
              ) : products.length === 0 ? (
                <div className="py-20 text-center font-bold text-gray-500">
                  등록된 상품이 없습니다.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-slate-50 border-b text-sm font-black text-gray-600">
                        <th className="px-5 py-4">
                          참고 이미지
                        </th>

                        <th className="px-5 py-4">
                          상품명
                        </th>

                        <th className="px-5 py-4">
                          분류
                        </th>

                        <th className="px-5 py-4">
                          가격
                        </th>

                        <th className="px-5 py-4">
                          제조사
                        </th>

                        <th className="px-5 py-4 text-center">
                          관리
                        </th>
                      </tr>
                    </thead>

                    <tbody className="divide-y">
                      {products.map(
                        (product) => (
                          <tr
                            key={product.proNum}
                            className="hover:bg-slate-50"
                          >
                            <td className="px-5 py-4">
                              {product.referenceImageUrl ? (
                                <img
                                  src={
                                    product.referenceImageUrl
                                  }
                                  alt="상품 참고"
                                  className="w-20 h-20 object-cover rounded-xl border"
                                />
                              ) : (
                                <div className="w-20 h-20 rounded-xl border border-dashed flex items-center justify-center text-xs text-gray-400 font-bold">
                                  없음
                                </div>
                              )}
                            </td>

                            <td className="px-5 py-5 font-black whitespace-nowrap">
                              {product.proName}
                            </td>

                            <td className="px-5 py-5">
                              <span className="px-3 py-1 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-black">
                                {product.category}
                              </span>
                            </td>

                            <td className="px-5 py-5 font-black whitespace-nowrap">
                              {formatPrice(
                                product.price
                              )}
                            </td>

                            <td className="px-5 py-5 font-bold whitespace-nowrap">
                              {product.company}
                            </td>

                            <td className="px-5 py-5">
                              <div className="flex justify-center gap-2">
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleEdit(
                                      product
                                    )
                                  }
                                  className="px-4 py-2 border-2 border-gray-200 rounded-xl text-xs font-black hover:border-emerald-600"
                                >
                                  수정
                                </button>

                                <button
                                  type="button"
                                  onClick={() =>
                                    handleProductDelete(
                                      product
                                    )
                                  }
                                  disabled={
                                    deletingProNum ===
                                    product.proNum
                                  }
                                  className="px-4 py-2 border-2 border-red-200 text-red-600 rounded-xl text-xs font-black hover:bg-red-50 disabled:bg-gray-100"
                                >
                                  {deletingProNum ===
                                  product.proNum
                                    ? '삭제 중'
                                    : '삭제'}
                                </button>
                              </div>
                            </td>
                          </tr>
                        )
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </section>
        </div>
      </main>

      <footer className="w-full bg-white border-t border-gray-200 py-6 text-center text-gray-600 text-xs mt-12">
        <p className="font-bold">
          © 2026 FarMMS. All rights reserved.
        </p>
      </footer>
    </div>
  );
}

function RecommendedChoiceField({
  label,
  options,
  value,
  isCustom,
  onSelect,
  onCustomSelect,
  inputId,
  inputName,
  onInputChange,
  inputPlaceholder,
  maxLength,
}) {
  return (
    <fieldset className="space-y-2.5">
      <legend className="text-sm font-black">
        {label}
      </legend>

      <div className="grid grid-cols-2 gap-2">
        {options.map((option) => {
          const isSelected =
            !isCustom && value === option;

          return (
            <button
              key={option}
              type="button"
              onClick={() => onSelect(option)}
              aria-pressed={isSelected}
              className={`min-h-11 px-3 py-2.5 rounded-xl border-2 text-xs font-black transition ${
                isSelected
                  ? 'border-emerald-700 bg-emerald-700 text-white shadow-sm'
                  : 'border-gray-200 bg-white text-gray-700 hover:border-emerald-400 hover:bg-emerald-50 hover:text-emerald-800'
              }`}
            >
              {option}
            </button>
          );
        })}
      </div>

      <button
        type="button"
        onClick={onCustomSelect}
        aria-pressed={isCustom}
        className={`w-full min-h-11 px-4 py-2.5 rounded-xl border-2 text-sm font-black transition ${
          isCustom
            ? 'border-emerald-700 bg-emerald-50 text-emerald-800'
            : 'border-gray-200 bg-slate-50 text-gray-700 hover:border-emerald-400 hover:bg-emerald-50 hover:text-emerald-800'
        }`}
      >
        직접 입력
      </button>

      {isCustom && (
        <input
          type="text"
          id={inputId}
          name={inputName}
          value={value}
          onChange={onInputChange}
          placeholder={inputPlaceholder}
          maxLength={maxLength}
          autoFocus
          className="w-full px-4 py-3.5 text-sm font-bold border-2 border-emerald-300 bg-emerald-50/40 rounded-2xl focus:outline-none focus:border-emerald-700"
        />
      )}
    </fieldset>
  );
}

function FormInput({
  label,
  id,
  name,
  type = 'text',
  value,
  onChange,
  placeholder,
  maxLength,
  min,
  inputMode,
  helperText,
}) {
  return (
    <div className="space-y-1.5">
      <label
        htmlFor={id}
        className="block text-sm font-black"
      >
        {label}
      </label>

      <input
        type={type}
        id={id}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        maxLength={maxLength}
        min={min}
        inputMode={inputMode}
        className="w-full px-4 py-3.5 text-sm font-bold border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-emerald-700"
      />

      {helperText && (
        <p className="px-1 text-xs font-bold text-gray-500">
          {helperText}
        </p>
      )}
    </div>
  );
}

function formatPhoneInput(value) {
  const numbers = String(value || '')
    .replace(/[^0-9]/g, '')
    .slice(0, 11);

  if (numbers.startsWith('02')) {
    if (numbers.length <= 2) {
      return numbers;
    }

    if (numbers.length <= 5) {
      return `${numbers.slice(0, 2)}-${numbers.slice(2)}`;
    }

    if (numbers.length <= 9) {
      return `${numbers.slice(0, 2)}-${numbers.slice(2, 5)}-${numbers.slice(5)}`;
    }

    return `${numbers.slice(0, 2)}-${numbers.slice(2, 6)}-${numbers.slice(6)}`;
  }

  if (numbers.length <= 3) {
    return numbers;
  }

  if (numbers.length <= 7) {
    return `${numbers.slice(0, 3)}-${numbers.slice(3)}`;
  }

  if (numbers.length <= 10) {
    return `${numbers.slice(0, 3)}-${numbers.slice(3, 6)}-${numbers.slice(6)}`;
  }

  return `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(7)}`;
}