export interface BannerType {
  image: Image;
  id: string;
  title: string;
  subTitle: string;
  description: null;
  bannerTag: string;
  alignment: string;
  primaryActionText: string;
  primaryActionLink: string;
  secondaryActionText: null;
  secondaryActionLink: null;
  bannerPosition: string;
  isActive: boolean;
  startDate: null;
  endDate: null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Image {
  url: string;
  publicId: string;
  alt: string;
}
