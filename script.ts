import fs from 'fs/promises';

(async () => {
  const res = await fetch(
    'https://v-gateway.vezeetaservices.com/inventory/api/V2/ProductShapes?from=1&size=1000&pharmacyTypeId=0&version=2',
  );

  const data = await res.json();

  const transformedData = data.productShapes.map((item: any) => {
    return {
      name: item.productNameEn,
      image: item.mainImageUrl,
      price: item.newPrice,
      category: item.category,
      description: item.productNameAr,
      substance: item.activeIngrediant[0]?.name ?? 'No Substance',
    };
  });
  await fs.writeFile(
    'data.json',
    JSON.stringify(transformedData, null, 2),
    'utf-8',
  );
  console.log('Data written to data.json');
})().catch((err) => {
  console.error('Error:', err);
  process.exit(1);
});
