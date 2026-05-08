export type Partner = {
  id: string;
  name: string;
  city: string;
  type: "cafe" | "restoran" | "hotel" | "avm" | "bar";
  coordinates: [number, number];
  status: "active" | "coming_soon";
  joinedDate?: string;
};

export const partners: Partner[] = [
  {
    id: "p1",
    name: "Cafe Cardo",
    city: "İstanbul",
    type: "cafe",
    coordinates: [29.0335, 41.0082],
    status: "active",
    joinedDate: "2026-01",
  },
  {
    id: "p2",
    name: "Marina Restaurant",
    city: "İzmir",
    type: "restoran",
    coordinates: [27.1287, 38.4192],
    status: "active",
    joinedDate: "2026-02",
  },
  {
    id: "p3",
    name: "Boutique Hotel A",
    city: "Ankara",
    type: "hotel",
    coordinates: [32.8597, 39.9334],
    status: "active",
    joinedDate: "2026-02",
  },
  {
    id: "p4",
    name: "Sahil Cafe",
    city: "Antalya",
    type: "cafe",
    coordinates: [30.7133, 36.8969],
    status: "active",
    joinedDate: "2026-03",
  },
  {
    id: "p5",
    name: "Lounge Premium",
    city: "Bursa",
    type: "bar",
    coordinates: [29.061, 40.1828],
    status: "coming_soon",
  },
  {
    id: "p6",
    name: "Skyline Restaurant",
    city: "Eskişehir",
    type: "restoran",
    coordinates: [30.5256, 39.7767],
    status: "coming_soon",
  },
];

export const networkStats = {
  totalPartners: 6,
  totalCities: 6,
  activePartners: 4,
  comingSoon: 2,
  coverage: "Tüm Türkiye",
};
