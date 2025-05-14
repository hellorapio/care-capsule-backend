import * as fs from 'fs/promises';

(async () => {
  const res = await fetch(
    'https://v-gateway.vezeetaservices.com/inventory/api/V2/ProductShapes?query=&from=1&size=4000&isTrending=false&pharmacyTypeId=0&version=2&headCategoryKey=fb6d83f2-c5a6-11ea-b3c7-06ab1037a2aa',
  );

  const data = await res.json();

  const transformedData = data.productShapes.map((item: any) => {
    return {
      name: item.productNameEn,
      image:
        item.mainImageUrl === null || item.mainImageUrl === ''
          ? 'https://www.makatimed.net.ph/wp-content/uploads/2020/09/1000-10.png'
          : item.mainImageUrl,
      price: item.newPrice,
      category: 'care',
      description: item.productNameAr,
      substance: item.activeIngrediant[0]?.name ?? 'No Substance',
    };
  });

  const res2 = await fetch(
    'https://v-gateway.vezeetaservices.com/inventory/api/V2/ProductShapes?query=&from=1&size=4000&isTrending=false&pharmacyTypeId=0&version=2&headCategoryKey=fb6d7e27-c5a6-11ea-b3c7-06ab1037a2aa',
  );

  const data2 = await res2.json();

  data2.productShapes.map((item: any) => {
    const med = {
      name: item.productNameEn,
      image:
        item.mainImageUrl === null || item.mainImageUrl === ''
          ? 'https://www.makatimed.net.ph/wp-content/uploads/2020/09/1000-10.png'
          : item.mainImageUrl,
      price: item.newPrice,
      category: 'medicine',
      description: item.productNameAr,
      substance: item.activeIngrediant[0]?.name ?? 'No Substance',
    };

    transformedData.push(med);

    return {
      name: item.productNameEn,
      image: item.mainImageUrl,
      price: item.newPrice,
      category: 'medicine',
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
