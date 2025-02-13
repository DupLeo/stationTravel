import qql from 'graphql-tag';

export const vehicleListQuery = qql`
  query vehicleList($page: Int, $size: Int, $search: String) {
    vehicleList(
      page: $page, 
      size: $size, 
      search: $search
    ) {
      id
      naming {
        make
        model
        chargetrip_version
      }    
      range {
        chargetrip_range{
          worst
        }
      }
      media {
        image {
          thumbnail_url
        }
      }
    }
  }
`;
