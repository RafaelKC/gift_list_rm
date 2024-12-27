export interface Gift {
  _id: string;
  gift_link: string;
  gift_price: number;
  gift_name: string;
  gift_image_url?: string;
  gift_description: string;
  selector_email?: string;
}

export interface GiftCreate {
  gift_link: string;
  gift_price: number;
  gift_name: string;
  gift_image_url?: string;
  gift_description: string;
}

export interface UpdateSelector {
  selector_email: string;
}
