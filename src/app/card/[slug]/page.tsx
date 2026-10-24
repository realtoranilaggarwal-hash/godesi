import { redirect } from "next/navigation";

/**
 * The standalone card page is gone — the digital card now sits beside the
 * full profile on /business/<slug>, with Save contact / Share / coupon / lead form
 * under it. Old /card/<slug> links forward here.
 */
export default function CardPageRedirect({
  params,
}: {
  params: { slug: string };
}) {
  redirect(`/business/${params.slug}`);
}
