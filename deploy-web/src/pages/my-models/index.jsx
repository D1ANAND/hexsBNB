import Layout from "@src/components/layout/Layout";
import PageContainer from "@src/components/shared/PageContainer";
import { Title } from "@src/components/shared/Title";
import { NextSeo } from "next-seo";
import Image from "next/image";
import Link from "next/link";

export default function MarketPlacePage() {
  return (
    <Layout>
      <NextSeo title={`Marketplace`} />

      <PageContainer>
        <Title value="My Models" />
        <p>hi</p>
      </PageContainer>
    </Layout>
  );
}
