export const getCategoryImage = (categoryText: string) => {
    let categoryImage: string;
    switch(categoryText) {
        case "Mexican":
            categoryImage = "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=960";
            break;

        case "Chinese":
        case "Hong Kong":
        case "Taiwanese":
            categoryImage = "https://plus.unsplash.com/premium_photo-1674601033631-79eeffaac6f9?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=928";
            break;

        case "Thai":
            categoryImage = "https://images.unsplash.com/photo-1637806930600-37fa8892069d?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=770";
            break;
        
        case "Vietnamese":
            categoryImage = "https://images.unsplash.com/photo-1701480253822-1842236c9a97?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1740";
            break;
        
        case "Japanese":
            categoryImage = "https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=627"
            break;

        case "Korean":
            categoryImage = "https://plus.unsplash.com/premium_photo-1661412855930-2936cf94e57a?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1932";
            break;

        case "Filipino":
        case "Cambodian":
        case "Laotian":
        case "Malaysian":
        case "Indonesian":
        case "Singaporean":
            categoryImage = "https://images.unsplash.com/photo-1673874302519-46c05e420384?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1160";
            break;
        
        case "Indian":
            categoryImage = "https://images.unsplash.com/photo-1683533761804-5fc12be0f684?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=776"
            break;

        case "Italian":
            categoryImage = "https://images.unsplash.com/photo-1516100882582-96c3a05fe590?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=774";
            break;
        
        case "French":
            categoryImage = "https://images.unsplash.com/photo-1600663791817-d74f5196ba29?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=774";
            break;

        case "Spanish":
            categoryImage = "https://images.unsplash.com/photo-1534080564583-6be75777b70a?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1740";
            break;

        case "British":
        case "English":
        case "UK":
            categoryImage = "https://images.unsplash.com/photo-1580554530778-ca36943938b2?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=928";
            break;

        case "German":
            categoryImage = "https://plus.unsplash.com/premium_photo-1692200698241-c0a7911ce1ea?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=978";
            break;

        case "Australian":
            categoryImage = "https://images.unsplash.com/photo-1608855238293-a8853e7f7c98?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1740";
            break;

        case "Mediterranean":
            categoryImage = "https://images.unsplash.com/photo-1680405531955-8b4981bb1b0c?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=774";
            break;
        
        case "Greek":
            categoryImage = "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=774";
            break;

        case "American":
            categoryImage = "https://images.unsplash.com/photo-1695924428716-0b09d79add5c?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=820";
            break;

        case "Mediterranean":
            categoryImage = "https://images.unsplash.com/photo-1680405531955-8b4981bb1b0c?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=774";
            break;

        case "Turkish":
            categoryImage = "https://images.unsplash.com/photo-1620167790054-de54f34308bb?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1740";
            break;
        
        case "Lebanese":
            categoryImage = "https://images.unsplash.com/photo-1653982960203-c8361d7bed96?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1740";
            break;

        case "African":
        case "East African":
        case "Central African":
        case "South African":
        case "Ethiopian":
        case "Kenyan":
        case "Somalian":
        case "Ugandan":
        case "Maasai":
        case "Congolese":
        case "Burundian":
        case "Swahili":
        case "Eritrean":
        case "Algerian":
        case "Egyptian":
        case "Libyan":
        case "Moroccan":
        case "Sudanese":
        case "Tunisian":
        case "Botswana":
        case "Malagasy":
        case "Namibian":
        case "Zimbabwean":
            categoryImage = "https://images.unsplash.com/photo-1680405531955-8b4981bb1b0c?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=774";
            break;

        case "Brazilian":
            categoryImage = "https://images.unsplash.com/photo-1626379907504-327b925f4b79?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1740";
            break;

        case "Argentinian":
            categoryImage = "https://images.unsplash.com/photo-1709389883900-b0b34592ba11?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1674";
            break;
        
        case "Peruvian":
            categoryImage = "https://plus.unsplash.com/premium_photo-1669261881745-1b59cb9adcfb?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=774";
            break;

        default:
            categoryImage = "https://images.unsplash.com/photo-1507048331197-7d4ac70811cf?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1674"
    };

    return categoryImage;
};