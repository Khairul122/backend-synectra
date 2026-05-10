export interface Portfolio {
  id:          string;
  title:       string;
  description: string | null;
  image:       string | null;
  images:      string[];
  category:    string | null;
  createdAt:   string;
  updatedAt:   string;
}
